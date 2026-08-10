import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VehiclesTable } from "@/components/admin/vehicles-table"
import { Plus } from "lucide-react"
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

async function getVehicles() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles:", error)
    return []
  }

  return data || []
}

export default async function AdminVeiculosPage() {
  await checkAdmin()
  const vehicles = await getVehicles()

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bebas text-4xl text-shark-silver">
                GESTÃO DE VEÍCULOS
              </h1>
              <p className="text-shark-silver/60 mt-1">
                {vehicles.length} veículos em inventário
              </p>
            </div>
            <Link
              href="/admin/veiculos/novo"
              className="flex items-center gap-2 px-6 py-3 bg-shark-gold text-shark-navy font-bebas text-lg rounded-lg hover:bg-shark-gold-light transition-colors"
            >
              <Plus className="w-5 h-5" />
              ADICIONAR VEÍCULO
            </Link>
          </div>

          {/* Vehicles Table */}
          <VehiclesTable vehicles={vehicles} />
        </div>
      </main>
    </div>
  )
}
