import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LeadsTable } from "@/components/admin/leads-table"
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

async function getLeads() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("leads")
    .select("*, vehicles(make, model)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching leads:", error)
    return []
  }

  return data || []
}

export default async function AdminLeadsPage() {
  await checkAdmin()
  const leads = await getLeads()

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
  }

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-bebas text-4xl text-shark-silver">
              GESTÃO DE LEADS
            </h1>
            <p className="text-shark-silver/60 mt-1">
              {stats.total} leads no total - {stats.new} novos
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-4">
              <p className="text-shark-silver/60 text-sm font-mono">TOTAL</p>
              <p className="font-bebas text-3xl text-shark-silver">{stats.total}</p>
            </div>
            <div className="bg-shark-gold/10 border border-shark-gold/20 rounded-xl p-4">
              <p className="text-shark-gold text-sm font-mono">NOVOS</p>
              <p className="font-bebas text-3xl text-shark-gold">{stats.new}</p>
            </div>
            <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4">
              <p className="text-blue-400 text-sm font-mono">CONTACTADOS</p>
              <p className="font-bebas text-3xl text-blue-400">{stats.contacted}</p>
            </div>
            <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
              <p className="text-green-400 text-sm font-mono">CONVERTIDOS</p>
              <p className="font-bebas text-3xl text-green-400">{stats.converted}</p>
            </div>
          </div>

          {/* Leads Table */}
          <LeadsTable leads={leads} />
        </div>
      </main>
    </div>
  )
}
