'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { STEP_TEMPLATES } from '@/lib/step-templates'
import {
  emailNewAccount,
  emailStepAdvanced,
  emailDocumentAvailable,
  emailNewAdminMessage,
} from '@/lib/email'
import type { OperationRole, StepStatus, InvoiceStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

// Ensures the caller is an authenticated admin. Throws otherwise.
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.is_admin !== true) {
    throw new Error('Não autorizado')
  }
  return user
}

async function logActivity(operationId: string, action: string, performedBy: string, detail?: string) {
  await supabaseAdmin.from('activity_log').insert({
    operation_id: operationId,
    action,
    performed_by: performedBy,
    detail: detail ?? null,
  })
}

function generateTempPassword(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

export type CreateAccountResult =
  | { ok: true; userId: string; tempPassword: string | null; existing: boolean }
  | { ok: false; error: string }

// Create a new auth user OR link an existing one by email.
export async function createClientAccount(
  fullName: string,
  email: string,
): Promise<CreateAccountResult> {
  const admin = await requireAdmin()
  const normalizedEmail = email.trim().toLowerCase()

  // Check for an existing profile with this email
  const { data: existingProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('email', normalizedEmail)
    .limit(1)

  if (existingProfiles && existingProfiles.length > 0) {
    return { ok: true, userId: existingProfiles[0].id, tempPassword: null, existing: true }
  }

  // Try to find an existing auth user by listing (linking case)
  const { data: list } = await supabaseAdmin.auth.admin.listUsers()
  const found = list?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail)
  if (found) {
    // Ensure a profile row exists
    await supabaseAdmin.from('profiles').upsert({
      id: found.id,
      email: normalizedEmail,
      full_name: fullName,
    })
    return { ok: true, userId: found.id, tempPassword: null, existing: true }
  }

  // Create new user
  const tempPassword = generateTempPassword()
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !created?.user) {
    return { ok: false, error: error?.message ?? 'Falha ao criar conta' }
  }

  await supabaseAdmin.from('profiles').insert({
    id: created.user.id,
    email: normalizedEmail,
    full_name: fullName,
  })

  await emailNewAccount(normalizedEmail, tempPassword)
  // Activity logged once the operation is created (needs operation_id); log account creation loosely
  console.log(`[operacoes] account created for ${normalizedEmail} by ${admin.email}`)

  return { ok: true, userId: created.user.id, tempPassword, existing: false }
}

export type CreateOperationInput = {
  profileId: string
  role: OperationRole
  vehicle?: {
    make?: string
    model?: string
    year?: number
    km?: number
    colour?: string
    plate?: string
    photoUrl?: string
    protocoloScore?: number
  }
  parceiro?: {
    investmentAmount?: number
    investmentDate?: string
    estimatedCloseDate?: string
  }
}

export async function createOperation(input: CreateOperationInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const admin = await requireAdmin()

  const { data: op, error } = await supabaseAdmin
    .from('operations')
    .insert({
      profile_id: input.profileId,
      role: input.role,
      vehicle_make: input.vehicle?.make ?? null,
      vehicle_model: input.vehicle?.model ?? null,
      vehicle_year: input.vehicle?.year ?? null,
      vehicle_km: input.vehicle?.km ?? null,
      vehicle_colour: input.vehicle?.colour ?? null,
      vehicle_plate: input.vehicle?.plate ?? null,
      vehicle_photo_url: input.vehicle?.photoUrl ?? null,
      protocolo_score: input.vehicle?.protocoloScore ?? null,
      investment_amount: input.parceiro?.investmentAmount ?? null,
      investment_date: input.parceiro?.investmentDate ?? null,
      estimated_close_date: input.parceiro?.estimatedCloseDate ?? null,
    })
    .select('id')
    .single()

  if (error || !op) {
    return { ok: false, error: error?.message ?? 'Falha ao criar operação' }
  }

  // Seed steps from template — first active, rest pending
  const labels = STEP_TEMPLATES[input.role]
  const steps = labels.map((label, i) => ({
    operation_id: op.id,
    step_order: i + 1,
    step_label: label,
    step_status: (i === 0 ? 'active' : 'pending') as StepStatus,
    completed_at: null,
  }))
  await supabaseAdmin.from('operation_steps').insert(steps)

  await logActivity(op.id, 'Operação criada', admin.email ?? 'admin', `Role: ${input.role}`)

  revalidatePath('/admin/operacoes')
  return { ok: true, id: op.id }
}

export async function updateStep(
  stepId: string,
  operationId: string,
  updates: { status: StepStatus; clientNote: string; internalNote: string; notifyClient: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin()

  const { error } = await supabaseAdmin
    .from('operation_steps')
    .update({
      step_status: updates.status,
      client_note: updates.clientNote || null,
      internal_note: updates.internalNote || null,
      notify_client: updates.notifyClient,
      completed_at: updates.status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', stepId)

  if (error) return { ok: false, error: error.message }

  const { data: step } = await supabaseAdmin
    .from('operation_steps')
    .select('step_label')
    .eq('id', stepId)
    .single()

  await logActivity(operationId, `Passo actualizado: ${step?.step_label ?? ''}`, admin.email ?? 'admin', `Estado: ${updates.status}`)

  if (updates.notifyClient) {
    const email = await getClientEmail(operationId)
    if (email) await emailStepAdvanced(email, step?.step_label ?? 'Actualização', updates.clientNote)
  }

  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

async function getClientEmail(operationId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('operations')
    .select('profiles(email, notification_email)')
    .eq('id', operationId)
    .single()
  // @ts-expect-error nested relation typing
  const profile = data?.profiles
  if (!profile || profile.notification_email === false) return null
  return profile.email ?? null
}

export async function uploadOperationDocument(
  operationId: string,
  docType: string,
  docLabel: string,
  fileName: string,
  fileBase64: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin()

  const buffer = Buffer.from(fileBase64.split(',').pop() ?? '', 'base64')
  const path = `${operationId}/admin/${Date.now()}-${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('client-documents')
    .upload(path, buffer, { upsert: true })

  if (uploadError) return { ok: false, error: uploadError.message }

  const { error } = await supabaseAdmin.from('documents').insert({
    operation_id: operationId,
    doc_type: docType,
    doc_label: docLabel,
    storage_path: path,
    uploaded_by: 'admin',
    status: 'disponivel',
  })
  if (error) return { ok: false, error: error.message }

  await logActivity(operationId, `Documento carregado: ${docLabel}`, admin.email ?? 'admin')

  const email = await getClientEmail(operationId)
  if (email) await emailDocumentAvailable(email, docLabel)

  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

export async function deleteDocument(docId: string, operationId: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  const { data: doc } = await supabaseAdmin.from('documents').select('storage_path').eq('id', docId).single()
  if (doc?.storage_path) {
    await supabaseAdmin.storage.from('client-documents').remove([doc.storage_path])
  }
  await supabaseAdmin.from('documents').delete().eq('id', docId)
  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

export async function upsertInvoice(
  operationId: string,
  invoice: {
    id?: string
    invoiceNumber: string
    description: string
    amount: number
    invoiceDate: string
    status: InvoiceStatus
  },
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin()

  const payload = {
    operation_id: operationId,
    invoice_number: invoice.invoiceNumber || null,
    description: invoice.description || null,
    amount: invoice.amount || null,
    invoice_date: invoice.invoiceDate || null,
    status: invoice.status,
  }

  const { error } = invoice.id
    ? await supabaseAdmin.from('invoices').update(payload).eq('id', invoice.id)
    : await supabaseAdmin.from('invoices').insert(payload)

  if (error) return { ok: false, error: error.message }

  await logActivity(operationId, invoice.id ? 'Factura actualizada' : 'Factura criada', admin.email ?? 'admin', invoice.invoiceNumber)
  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

export async function deleteInvoice(invoiceId: string, operationId: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  await supabaseAdmin.from('invoices').delete().eq('id', invoiceId)
  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

export async function sendAdminMessage(operationId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!body.trim()) return { ok: false, error: 'Mensagem vazia' }

  const { error } = await supabaseAdmin.from('messages').insert({
    operation_id: operationId,
    sender: 'admin',
    sender_name: 'Equipa Shark',
    body: body.trim(),
  })
  if (error) return { ok: false, error: error.message }

  const email = await getClientEmail(operationId)
  if (email) await emailNewAdminMessage(email, body.trim().slice(0, 140))

  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

export async function updateResults(
  operationId: string,
  results: { resultAmount: number | null; resultDate: string | null; resultNotes: string },
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin()
  const { error } = await supabaseAdmin
    .from('operations')
    .update({
      result_amount: results.resultAmount,
      result_date: results.resultDate,
      result_notes: results.resultNotes || null,
    })
    .eq('id', operationId)

  if (error) return { ok: false, error: error.message }
  await logActivity(operationId, 'Resultados actualizados', admin.email ?? 'admin')
  revalidatePath(`/admin/operacoes/${operationId}`)
  return { ok: true }
}

// Signed URL — server-side only
export async function getAdminSignedUrl(storagePath: string): Promise<{ url: string | null }> {
  await requireAdmin()
  const { data } = await supabaseAdmin.storage
    .from('client-documents')
    .createSignedUrl(storagePath, 1800)
  return { url: data?.signedUrl ?? null }
}

// Upload a vehicle photo during operation creation → returns public-ish signed path stored on operation
export async function uploadOperationPhoto(
  fileName: string,
  fileBase64: string,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  await requireAdmin()
  const buffer = Buffer.from(fileBase64.split(',').pop() ?? '', 'base64')
  const path = `operation-photos/${Date.now()}-${fileName}`
  const { error } = await supabaseAdmin.storage
    .from('client-documents')
    .upload(path, buffer, { upsert: true })
  if (error) return { ok: false, error: error.message }
  return { ok: true, path }
}
