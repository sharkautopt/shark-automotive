'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { emailClientUploadedDoc, emailNewClientMessage } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return { user, supabase }
}

// Confirm the authenticated user owns the given operation (RLS-backed check).
async function userOwnsOperation(operationId: string, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from('operations')
    .select('id')
    .eq('id', operationId)
    .eq('profile_id', userId)
    .maybeSingle()
  return !!data
}

// Generate a signed URL for the operation's dossier (vehicle_photo_url doubles as dossier path here is NOT used;
// dossier is stored as a document of type 'dossier'). Verifies ownership first.
export async function getDossierUrl(operationId: string): Promise<{ url?: string; error?: string }> {
  const { user, supabase } = await requireUser()
  if (!(await userOwnsOperation(operationId, user.id, supabase))) return { error: 'Não autorizado' }

  const { data: dossier } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('operation_id', operationId)
    .eq('doc_type', 'dossier')
    .not('storage_path', 'is', null)
    .order('uploaded_at', { ascending: false })
    .maybeSingle()

  if (!dossier?.storage_path) return { error: 'Dossier ainda não disponível.' }

  const { data } = await supabaseAdmin.storage.from('client-documents').createSignedUrl(dossier.storage_path, 1800)
  return data?.signedUrl ? { url: data.signedUrl } : { error: 'Não foi possível gerar o link.' }
}

// Signed URL for any document/invoice path the user owns.
export async function getDocumentUrl(operationId: string, storagePath: string): Promise<{ url?: string; error?: string }> {
  const { user, supabase } = await requireUser()
  if (!(await userOwnsOperation(operationId, user.id, supabase))) return { error: 'Não autorizado' }

  // Ensure the path belongs to this operation (documents or invoices)
  const { data: doc } = await supabase
    .from('documents')
    .select('id')
    .eq('operation_id', operationId)
    .eq('storage_path', storagePath)
    .maybeSingle()
  const { data: inv } = await supabase
    .from('invoices')
    .select('id')
    .eq('operation_id', operationId)
    .eq('storage_path', storagePath)
    .maybeSingle()

  if (!doc && !inv) return { error: 'Documento não encontrado.' }

  const { data, error } = await supabaseAdmin.storage.from('client-documents').createSignedUrl(storagePath, 1800)
  if (error || !data?.signedUrl) return { error: error?.message || 'Não foi possível gerar o link.' }
  return { url: data.signedUrl }
}

export async function uploadClientDocument(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const { user, supabase } = await requireUser()
  const operationId = formData.get('operationId') as string
  const file = formData.get('file') as File | null
  if (!operationId || !file) return { error: 'Ficheiro em falta.' }
  if (!(await userOwnsOperation(operationId, user.id, supabase))) return { error: 'Não autorizado' }

  const buffer = Buffer.from(await file.arrayBuffer())
  const path = `${operationId}/client/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('client-documents')
    .upload(path, buffer, { upsert: true, contentType: file.type || undefined })
  if (uploadError) return { error: uploadError.message }

  const { error } = await supabaseAdmin.from('documents').insert({
    operation_id: operationId,
    doc_type: 'cliente_upload',
    doc_label: file.name,
    storage_path: path,
    uploaded_by: 'client',
    status: 'disponivel',
  })
  if (error) return { error: error.message }

  const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).single()
  await supabaseAdmin.from('activity_log').insert({
    operation_id: operationId,
    action: `Documento submetido pelo cliente: ${file.name}`,
    performed_by: profile?.full_name || user.email || 'cliente',
  })
  await emailClientUploadedDoc(profile?.full_name || user.email || 'Cliente', file.name)

  revalidatePath('/area-cliente')
  return { ok: true }
}

export async function sendClientMessage(operationId: string, body: string): Promise<{ ok?: boolean; error?: string }> {
  const { user, supabase } = await requireUser()
  if (!body.trim()) return { error: 'Mensagem vazia' }
  if (!(await userOwnsOperation(operationId, user.id, supabase))) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // Insert via user-scoped client so RLS insert policy applies (sender = 'client')
  const { error } = await supabase.from('messages').insert({
    operation_id: operationId,
    sender: 'client',
    sender_name: profile?.full_name || user.email || 'Cliente',
    body: body.trim(),
  })
  if (error) return { error: error.message }

  await emailNewClientMessage(profile?.full_name || user.email || 'Cliente', body.trim().slice(0, 140))
  return { ok: true }
}

export async function updateProfile(updates: {
  full_name: string
  email: string
  phone: string
  notification_email: boolean
}): Promise<{ ok?: boolean; error?: string }> {
  const { user, supabase } = await requireUser()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name,
      email: updates.email || null,
      phone: updates.phone || null,
      notification_email: updates.notification_email,
    })
    .eq('id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/area-cliente')
  return { ok: true }
}

export async function sendPasswordReset(): Promise<{ ok?: boolean; error?: string }> {
  const { user, supabase } = await requireUser()
  if (!user.email) return { error: 'Sem email associado.' }
  const site = process.env.NEXT_PUBLIC_SITE_URL || ''
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${site}/redefinir-password`,
  })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function clientSignOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
