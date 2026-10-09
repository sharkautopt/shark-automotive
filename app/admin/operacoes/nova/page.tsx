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

async function getStockVehicles(): Promise<StockVehicleOption[]> {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select('id, make, model, year, mileage, price, status, plate, exterior_color, protocol_score, photos')
    .in('status', ['available', 'reserved'])
    .order('created_at', { ascending: false })
  if (error || !data) {
    console.error('[operacoes/nova] stock fetch error:', error)
    return []
  }

  // Carros que já têm uma operação (evita vender o mesmo duas vezes). Se a
  // migração 006 ainda não foi corrida a coluna não existe: ignora, não parte.
  const taken = new Set<string>()
  const { data: ops, error: opsErr } = await supabaseAdmin.from('operations').select('vehicle_id').not('vehicle_id', 'is', null)
  if (!opsErr) for (const o of ops ?? []) taken.add(String(o.vehicle_id))

  return data.map((v) => ({
    id: String(v.id),
    make: v.make,
    model: v.model,
    year: v.year,
    mileage: v.mileage,
    price: v.price,
    status: v.status,
    plate: v.plate,
    colour: v.exterior_color,
    protocolScore: v.protocol_score,
    photo: Array.isArray(v.photos) ? (v.photos[0] ?? null) : null,
    hasOperation: taken.has(String(v.id)),
  }))
}

export default async function NovaOperacaoPage() {
  await checkAdmin()
  const stockVehicles = await getStockVehicles()

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
          <OperationForm stockVehicles={stockVehicles} />
        </div>
      </main>
    </div>
  )
}
