import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Car, Users, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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

async function getStats() {
  const supabase = await createClient()
  
  const [vehiclesResult, leadsResult, newLeadsResult] = await Promise.all([
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
  ])

  return {
    totalVehicles: vehiclesResult.count || 0,
    totalLeads: leadsResult.count || 0,
    newLeads: newLeadsResult.count || 0,
  }
}

async function getRecentLeads() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return data || []
}

async function getRecentVehicles() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return data || []
}

export default async function AdminDashboardPage() {
  const user = await checkAdmin()
  
  const [stats, recentLeads, recentVehicles] = await Promise.all([
    getStats(),
    getRecentLeads(),
    getRecentVehicles(),
  ])

  const statCards = [
    {
      label: "Veículos em Stock",
      value: stats.totalVehicles,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total de Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Leads Novos",
      value: stats.newLeads,
      icon: AlertCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Taxa de Conversão",
      value: "12.5%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="min-h-screen bg-card text-foreground flex">
      <AdminSidebar user={user} />
      
      <main className="flex-1 p-6 ml-64 bg-card">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              DASHBOARD
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visão geral do negócio
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">{stat.label}</p>
                <p className="font-display text-3xl text-foreground mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Data */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">LEADS RECENTES</h2>
                <Link
                  href="/admin/leads"
                  className="text-primary text-xs hover:text-primary/80 transition-colors font-medium"
                >
                  Ver todos
                </Link>
              </div>
              
              {recentLeads.length > 0 ? (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="text-foreground text-sm font-medium">{lead.name}</p>
                        <p className="text-muted-foreground text-xs">{lead.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${
                          lead.status === "new" 
                            ? "bg-primary/20 text-primary"
                            : lead.status === "contacted"
                            ? "bg-foreground/10 text-foreground"
                            : "bg-foreground/10 text-foreground"
                        }`}>
                          {lead.status?.toUpperCase()}
                        </span>
                        <p className="text-muted-foreground text-xs mt-1">
                          {new Date(lead.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  Sem leads recentes
                </p>
              )}
            </div>

            {/* Recent Vehicles */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">VEÍCULOS RECENTES</h2>
                <Link
                  href="/admin/veiculos"
                  className="text-primary text-xs hover:text-primary/80 transition-colors font-medium"
                >
                  Ver todos
                </Link>
              </div>
              
              {recentVehicles.length > 0 ? (
                <div className="space-y-3">
                  {recentVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {vehicle.year} • {vehicle.mileage?.toLocaleString()} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-display text-lg">
                          {vehicle.price?.toLocaleString()}€
                        </p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${
                          vehicle.status === "available" 
                            ? "bg-primary/20 text-primary"
                            : vehicle.status === "reserved"
                            ? "bg-foreground/10 text-foreground"
                            : "bg-foreground/10 text-foreground"
                        }`}>
                          {vehicle.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  Sem veículos em stock
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
