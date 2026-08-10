import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SettingsForm } from "@/components/admin/settings-form"

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

async function getSettings() {
  const supabase = await createClient()

  const { data } = await supabase.from("site_settings").select("*")

  const settings: Record<string, Record<string, unknown>> = {}
  ;(data || []).forEach((row) => {
    settings[row.key] = row.value
  })

  return settings
}

export default async function AdminConfiguracoesPage() {
  const user = await checkAdmin()
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar user={user} />

      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8 max-w-3xl">
          {/* Header */}
          <div>
            <h1 className="font-bebas text-4xl text-shark-silver">CONFIGURAÇÕES</h1>
            <p className="text-shark-silver/60 mt-1">
              Gerir dados de contacto e estatísticas do site
            </p>
          </div>

          <SettingsForm
            contact={settings.contact || {}}
            statistics={settings.statistics || {}}
            social={settings.social || {}}
          />
        </div>
      </main>
    </div>
  )
}
