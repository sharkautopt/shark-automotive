import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Car, Users, TrendingUp, Euro, CheckCircle, Clock } from "lucide-react"

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const isAdmin = user.user_metadata?.is_admin === true
  if (!isAdmin) {
    redirect("/admin/login?error=unauthorized")
  }

  return user
}

async function getReportData() {
  const supabase = await createClient()

  const [vehiclesResult, leadsResult] = await Promise.all([
    supabase.from("vehicles").select("*"),
    supabase.from("leads").select("*"),
  ])

  const vehicles = vehiclesResult.data || []
  const leads = leadsResult.data || []

  const available = vehicles.filter((v) => v.status === "available")
  const reserved = vehicles.filter((v) => v.status === "reserved")
  const sold = vehicles.filter((v) => v.status === "sold")

  const stockValue = available.reduce((sum, v) => sum + Number(v.price || 0), 0)
  const soldValue = sold.reduce((sum, v) => sum + Number(v.price || 0), 0)

  const convertedLeads = leads.filter((l) => l.status === "converted").length
  const conversionRate = leads.length > 0
    ? ((convertedLeads / leads.length) * 100).toFixed(1)
    : "0.0"

  // Leads by type
  const leadsByType: Record<string, number> = {}
  leads.forEach((l) => {
    leadsByType[l.lead_type] = (leadsByType[l.lead_type] || 0) + 1
  })

  // Leads by status
  const leadsByStatus: Record<string, number> = {}
  leads.forEach((l) => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1
  })

  return {
    totalVehicles: vehicles.length,
    available: available.length,
    reserved: reserved.length,
    sold: sold.length,
    stockValue,
    soldValue,
    totalLeads: leads.length,
    convertedLeads,
    conversionRate,
    leadsByType,
    leadsByStatus,
  }
}

const typeLabels: Record<string, string> = {
  contact: "Contacto",
  vehicle_inquiry: "Interesse Viatura",
  import_request: "Importação",
  financing: "Financiamento",
  investment_partner: "Investimento",
}

const statusLabels: Record<string, string> = {
  new: "Novos",
  contacted: "Contactados",
  qualified: "Qualificados",
  negotiating: "Em negociação",
  converted: "Convertidos",
  lost: "Perdidos",
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AdminRelatoriosPage() {
  const user = await checkAdmin()
  const data = await getReportData()

  const kpis = [
    { label: "Valor em Stock", value: formatEuro(data.stockValue), icon: Euro, color: "text-shark-gold", bg: "bg-shark-gold/10" },
    { label: "Valor Vendido", value: formatEuro(data.soldValue), icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Veículos Vendidos", value: data.sold, icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Taxa de Conversão", value: `${data.conversionRate}%`, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
  ]

  const stockBreakdown = [
    { label: "Disponíveis", value: data.available, color: "bg-green-400" },
    { label: "Reservados", value: data.reserved, color: "bg-yellow-400" },
    { label: "Vendidos", value: data.sold, color: "bg-red-400" },
  ]

  const maxTypeCount = Math.max(1, ...Object.values(data.leadsByType))

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar user={user} />

      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-bebas text-4xl text-shark-silver">RELATÓRIOS</h1>
            <p className="text-shark-silver/60 mt-1">Análise de desempenho do negócio</p>
          </div>

          {/* KPIs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
                <div className={`w-12 h-12 ${kpi.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <p className="text-shark-silver/60 text-sm font-mono">{kpi.label}</p>
                <p className="font-bebas text-3xl text-shark-silver mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Stock breakdown */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Car className="w-5 h-5 text-shark-gold" />
                <h2 className="font-bebas text-2xl text-shark-silver">DISTRIBUIÇÃO DE STOCK</h2>
              </div>
              <div className="space-y-4">
                {stockBreakdown.map((item, i) => {
                  const pct = data.totalVehicles > 0 ? (item.value / data.totalVehicles) * 100 : 0
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-shark-silver/80">{item.label}</span>
                        <span className="text-shark-silver font-mono">{item.value}</span>
                      </div>
                      <div className="h-2 bg-shark-navy rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leads by type */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-shark-gold" />
                <h2 className="font-bebas text-2xl text-shark-silver">LEADS POR TIPO</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(data.leadsByType).length > 0 ? (
                  Object.entries(data.leadsByType).map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-shark-silver/80">{typeLabels[type] || type}</span>
                        <span className="text-shark-silver font-mono">{count}</span>
                      </div>
                      <div className="h-2 bg-shark-navy rounded-full overflow-hidden">
                        <div className="h-full bg-shark-gold rounded-full transition-all" style={{ width: `${(count / maxTypeCount) * 100}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-shark-silver/50 text-center py-4">Sem dados</p>
                )}
              </div>
            </div>
          </div>

          {/* Leads by status */}
          <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-shark-gold" />
              <h2 className="font-bebas text-2xl text-shark-silver">PIPELINE DE LEADS</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.keys(statusLabels).map((status) => (
                <div key={status} className="bg-shark-navy/50 rounded-lg p-4 text-center">
                  <p className="font-bebas text-3xl text-shark-silver">{data.leadsByStatus[status] || 0}</p>
                  <p className="text-shark-silver/50 text-xs font-mono mt-1">{statusLabels[status]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
