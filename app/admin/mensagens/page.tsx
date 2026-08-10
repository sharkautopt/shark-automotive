import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Mail, Phone, Calendar } from "lucide-react"

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

async function getMessages() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leads")
    .select("*, vehicles(make, model)")
    .in("lead_type", ["contact", "vehicle_inquiry"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  return data || []
}

const typeLabels: Record<string, string> = {
  contact: "Contacto Geral",
  vehicle_inquiry: "Interesse em Viatura",
}

export default async function AdminMensagensPage() {
  const user = await checkAdmin()
  const messages = await getMessages()

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar user={user} />

      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-bebas text-4xl text-shark-silver">MENSAGENS</h1>
            <p className="text-shark-silver/60 mt-1">
              {messages.length} mensagens recebidas
            </p>
          </div>

          {/* Messages List */}
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bebas text-2xl text-shark-silver">
                          {msg.name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-mono bg-shark-gold/20 text-shark-gold">
                          {typeLabels[msg.lead_type] || msg.lead_type}
                        </span>
                      </div>
                      {msg.vehicles && (
                        <p className="text-shark-silver/60 text-sm mt-1">
                          Viatura: {msg.vehicles.make} {msg.vehicles.model}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-shark-silver/40 text-xs font-mono">
                      <Calendar className="w-4 h-4" />
                      {new Date(msg.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {msg.message && (
                    <p className="text-shark-silver/80 bg-shark-navy/50 rounded-lg p-4 mb-4 leading-relaxed">
                      {msg.message}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center gap-2 text-shark-gold hover:text-shark-gold-light text-sm transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {msg.email}
                    </a>
                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="flex items-center gap-2 text-shark-gold hover:text-shark-gold-light text-sm transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {msg.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-12 text-center">
              <p className="text-shark-silver/50">Sem mensagens de momento</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
