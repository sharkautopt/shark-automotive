import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { ClientDashboard } from '@/components/client/client-dashboard'
import type { Profile, Operation, OperationStepClient, OperationDocument, Invoice, Message } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AreaClientePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Most recent operation for this client
  const { data: operation } = await supabase
    .from('operations')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!operation) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md border border-[#C8C4BC] bg-white p-8 text-center">
          <h1 className="font-bebas text-2xl tracking-wide text-[#0D1B2A]">Sem operação activa</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#0D1B2A]/70">
            A tua conta ainda não tem nenhuma operação associada. A equipa Shark irá configurar o teu
            processo em breve.
          </p>
          <form action="/login" className="mt-6">
            <a
              href="/login"
              className="inline-block bg-[#0D1B2A] px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#E8E4DC]"
            >
              Terminar sessão
            </a>
          </form>
        </div>
      </div>
    )
  }

  // SECURITY: internal_note intentionally excluded from client query
  const { data: steps } = await supabase
    .from('operation_steps')
    .select('id, step_order, step_label, step_status, completed_at, client_note')
    .eq('operation_id', operation.id)
    .order('step_order', { ascending: true })

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('operation_id', operation.id)
    .order('uploaded_at', { ascending: false })

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('operation_id', operation.id)
    .order('invoice_date', { ascending: false })

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('operation_id', operation.id)
    .order('created_at', { ascending: true })

  // Vehicle photo lives in the private bucket — resolve to a signed URL for display.
  const resolvedOperation = { ...operation } as Operation
  if (resolvedOperation.vehicle_photo_url) {
    const { data: signed } = await supabaseAdmin.storage
      .from('client-documents')
      .createSignedUrl(resolvedOperation.vehicle_photo_url, 1800)
    resolvedOperation.vehicle_photo_url = signed?.signedUrl ?? null
  }

  return (
    <ClientDashboard
      profile={profile as Profile}
      operation={resolvedOperation}
      steps={(steps ?? []) as OperationStepClient[]}
      documents={(documents ?? []) as OperationDocument[]}
      invoices={(invoices ?? []) as Invoice[]}
      messages={(messages ?? []) as Message[]}
    />
  )
}
