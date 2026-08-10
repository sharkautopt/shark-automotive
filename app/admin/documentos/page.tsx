import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/service-role"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { EncomendaGenerator } from "@/components/admin/encomenda-generator"
import { RecentDocuments } from "@/components/admin/recent-documents"

async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (user.user_metadata?.is_admin !== true) redirect("/admin/login?error=unauthorized")
  return user
}

async function getVehicles() {
  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .select("id, make, model, year, price, mileage, fuel_type, power, exterior_color, interior_color, country_origin, transmission, photos, vin, description, body_type, doors, seats, engine_size, co2_emissions, registration_date, first_owner, service_history, warranty_months, carpass_status, protocol_score")
    .order("created_at", { ascending: false })

  if (error) {
    console.log("[v0] documentos vehicles fetch error:", error.message)
    return []
  }
  return data || []
}

async function getRecentDocuments() {
  const { data, error } = await supabaseAdmin
    .from("generated_documents")
    .select("id, doc_type, title, public_url, client_name, document_number, created_at")
    .in("doc_type", ["encomenda_proposta", "encomenda_orcamento"])
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.log("[v0] documentos recent fetch error:", error.message)
    return []
  }
  return data || []
}

export default async function AdminDocumentosPage() {
  await checkAdmin()
  const [vehicles, recent] = await Promise.all([getVehicles(), getRecentDocuments()])

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          <div>
            <h1 className="font-bebas text-4xl text-shark-silver">DOCUMENTOS</h1>
            <p className="text-shark-silver/60 mt-1">
              Gere propostas comerciais e orçamentos formais para encomendas de importação.
            </p>
          </div>

          <EncomendaGenerator vehicles={vehicles} />

          <div className="pt-4 border-t border-shark-gold/10">
            <h2 className="font-bebas text-2xl text-shark-silver mb-4">DOCUMENTOS RECENTES</h2>
            <RecentDocuments documents={recent} />
          </div>
        </div>
      </main>
    </div>
  )
}
