import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { OperationForm } from '@/components/admin/operation-form'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
  return user
}

export default async function NovaOperacaoPage() {
  await checkAdmin()

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          <div>
            <Link href="/admin/operacoes" className="inline-flex items-center gap-2 text-shark-silver/60 hover:text-shark-silver mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar às operações
            </Link>
            <h1 className="font-bebas text-4xl text-shark-silver">NOVA OPERAÇÃO</h1>
            <p className="text-shark-silver/60 mt-1">Cria a conta do cliente e configura o processo</p>
          </div>
          <OperationForm />
        </div>
      </main>
    </div>
  )
}
