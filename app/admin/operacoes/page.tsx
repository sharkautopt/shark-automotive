import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { RoleBadge } from '@/components/admin/role-badge'
import type { OperationRole } from '@/lib/types'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
  return user
}

type OperationRow = {
  id: string
  role: OperationRole
  vehicle_make: string | null
  vehicle_model: string | null
  status: string
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
  operation_steps: { step_label: string; step_status: string; step_order: number }[]
}

async function getOperations(): Promise<OperationRow[]> {
  const { data, error } = await supabaseAdmin
    .from('operations')
    .select('id, role, vehicle_make, vehicle_model, status, created_at, profiles(full_name, email), operation_steps(step_label, step_status, step_order)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[operacoes] fetch error:', error)
    return []
  }
  return (data as unknown as OperationRow[]) || []
}

function currentStep(steps: OperationRow['operation_steps']): string {
  const active = [...steps].sort((a, b) => a.step_order - b.step_order).find((s) => s.step_status === 'active')
  if (active) return active.step_label
  const lastCompleted = [...steps].sort((a, b) => b.step_order - a.step_order).find((s) => s.step_status === 'completed')
  return lastCompleted ? lastCompleted.step_label : '—'
}

export default async function AdminOperationsPage() {
  await checkAdmin()
  const operations = await getOperations()

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bebas text-4xl text-shark-silver">OPERAÇÕES</h1>
              <p className="text-shark-silver/60 mt-1">{operations.length} operações no total</p>
            </div>
            <Link
              href="/admin/operacoes/nova"
              className="flex items-center gap-2 bg-shark-gold text-shark-navy font-medium px-5 py-3 rounded-lg hover:bg-shark-gold-light transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Operação
            </Link>
          </div>

          <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-shark-gold/10 text-shark-silver/60 font-mono text-xs uppercase">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Viatura</th>
                  <th className="p-4">Passo actual</th>
                  <th className="p-4">Última actualização</th>
                  <th className="p-4 text-right">Ver</th>
                </tr>
              </thead>
              <tbody>
                {operations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-shark-silver/50">
                      Ainda não existem operações. Cria a primeira.
                    </td>
                  </tr>
                ) : (
                  operations.map((op) => (
                    <tr key={op.id} className="border-b border-shark-gold/5 hover:bg-shark-navy/40 transition-colors">
                      <td className="p-4">
                        <p className="text-shark-silver">{op.profiles?.full_name || '—'}</p>
                        <p className="text-shark-silver/50 text-sm">{op.profiles?.email}</p>
                      </td>
                      <td className="p-4"><RoleBadge role={op.role} /></td>
                      <td className="p-4 text-shark-silver/80">
                        {op.vehicle_make ? `${op.vehicle_make} ${op.vehicle_model ?? ''}` : '—'}
                      </td>
                      <td className="p-4 text-shark-silver/80">{currentStep(op.operation_steps)}</td>
                      <td className="p-4 text-shark-silver/50 text-sm">
                        {new Date(op.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/operacoes/${op.id}`} className="text-shark-gold hover:text-shark-gold-light">
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
