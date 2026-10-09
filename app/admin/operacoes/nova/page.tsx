import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { OperationForm, type StockVehicleOption } from '@/components/admin/operation-form'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
  return user
}

async function getStockVehicles(): Promise<{ vehicles: StockVehicleOption[]; error: string | null }> {
  // select('*') de propósito: pedir colunas concretas faz a consulta inteira falhar
  // se alguma não existir na base real. Tudo o que não seja "vendido" conta como stock.
  const { data, error } = await supabaseAdmin.from('vehicles').select('*').order('created_at', { ascending: false })
  if (error || !data) {
    console.error('[operacoes/nova] stock fetch error:', error)
    return { vehicles: [], error: error?.message ?? 'Sem resposta da base de dados.' }
  }

  // Carros que já têm uma operação (evita vender o mesmo duas vezes). Se a
  // migração 006 ainda não foi corrida a coluna não existe: ignora, não parte.
  const taken = new Set<string>()
  const { data: ops, error: opsErr } = await supabaseAdmin.from('operations').select('vehicle_id').not('vehicle_id', 'is', null)
  if (!opsErr) for (const o of ops ?? []) taken.add(String(o.vehicle_id))

  const vehicles = data
    .filter((v) => v.status !== 'sold')
    .map((v) => ({
      id: String(v.id),
      make: String(v.make ?? ''),
      model: String(v.model ?? ''),
      year: Number(v.year ?? 0),
      mileage: Number(v.mileage ?? 0),
      price: v.price != null ? Number(v.price) : null,
      status: v.status === 'reserved' ? ('reserved' as const) : ('available' as const),
      plate: (v.plate as string | null) ?? null,
      colour: (v.exterior_color as string | null) ?? null,
      protocolScore: v.protocol_score != null ? Number(v.protocol_score) : null,
      photo: Array.isArray(v.photos) ? ((v.photos[0] as string | undefined) ?? null) : null,
      hasOperation: taken.has(String(v.id)),
    }))
  return { vehicles, error: null }
}

export default async function NovaOperacaoPage() {
  await checkAdmin()
  const { vehicles: stockVehicles, error: stockError } = await getStockVehicles()

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          <div>
            <Link href="/admin/operacoes" className="inline-flex items-center gap-2 text-muted-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar às operações
            </Link>
            <h1 className="font-display text-4xl text-foreground">NOVA OPERAÇÃO</h1>
            <p className="text-muted-foreground/60 mt-1">Cria a conta do cliente e configura o processo</p>
          </div>
          <OperationForm stockVehicles={stockVehicles} stockError={stockError} />
        </div>
      </main>
    </div>
  )
}
