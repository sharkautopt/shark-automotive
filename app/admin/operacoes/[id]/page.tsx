import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { RoleBadge } from '@/components/admin/role-badge'
import { OperationDetail } from '@/components/admin/operation-detail'
import type {
  Operation,
  OperationStep,
  OperationDocument,
  Invoice,
  Message,
  ActivityLogEntry,
  Profile,
} from '@/lib/types'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
  return user
}

export default async function OperationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await params

  const { data: operation } = await supabaseAdmin
    .from('operations')
    .select('*')
    .eq('id', id)
    .single()

  if (!operation) notFound()

  const [{ data: profile }, { data: steps }, { data: documents }, { data: invoices }, { data: messages }, { data: activity }] =
    await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', operation.profile_id).single(),
      supabaseAdmin.from('operation_steps').select('*').eq('operation_id', id).order('step_order'),
      supabaseAdmin.from('documents').select('*').eq('operation_id', id).order('uploaded_at', { ascending: false }),
      supabaseAdmin.from('invoices').select('*').eq('operation_id', id).order('invoice_date', { ascending: false }),
      supabaseAdmin.from('messages').select('*').eq('operation_id', id).order('created_at'),
      supabaseAdmin.from('activity_log').select('*').eq('operation_id', id).order('performed_at', { ascending: false }),
    ])

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-6">
          <div>
            <Link href="/admin/operacoes" className="inline-flex items-center gap-2 text-muted-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar às operações
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="font-display text-4xl text-foreground">
                {(profile as Profile)?.full_name || (profile as Profile)?.email || 'Operação'}
              </h1>
              <RoleBadge role={(operation as Operation).role} />
            </div>
            <p className="text-muted-foreground/60 mt-1">
              {operation.vehicle_make ? `${operation.vehicle_make} ${operation.vehicle_model ?? ''}` : 'Operação de parceria'}
            </p>
          </div>

          <OperationDetail
            operation={operation as Operation}
            profile={profile as Profile}
            steps={(steps as OperationStep[]) ?? []}
            documents={(documents as OperationDocument[]) ?? []}
            invoices={(invoices as Invoice[]) ?? []}
            messages={(messages as Message[]) ?? []}
            activity={(activity as ActivityLogEntry[]) ?? []}
          />
        </div>
      </main>
    </div>
  )
}
