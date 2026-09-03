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
    .select("id, make, model, year, price, mileage, fuel_type, power, exterior_color, country_origin, transmission, photos")
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
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          <div className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-primary">Centro documental</p>
              <h1 className="font-display text-4xl text-foreground">DOCUMENTOS</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Cria propostas e orçamentos completos a partir do stock, de um anúncio ou de dados introduzidos manualmente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:w-72">
              <div className="border border-border bg-card p-3"><span className="block text-muted-foreground">Disponíveis</span><strong className="mt-1 block text-lg text-foreground">{vehicles.length}</strong></div>
              <div className="border border-border bg-card p-3"><span className="block text-muted-foreground">Recentes</span><strong className="mt-1 block text-lg text-foreground">{recent.length}</strong></div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Escolher origem", "Stock, URL ou texto do anúncio"],
              ["02", "Rever dados", "Confirma campos, ISV e margens"],
              ["03", "Gerar documento", "PDF pronto para partilhar"],
            ].map(([number, title, description]) => (
              <div key={number} className="border border-border/80 bg-card/60 p-4">
                <span className="font-mono text-xs text-primary">{number}</span>
                <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <EncomendaGenerator vehicles={vehicles} />

          <div className="pt-4 border-t border-primary/10">
            <h2 className="font-display text-2xl text-foreground mb-4">DOCUMENTOS RECENTES</h2>
            <RecentDocuments documents={recent} />
          </div>
        </div>
      </main>
    </div>
  )
}
