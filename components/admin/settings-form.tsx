"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Save, Check } from "lucide-react"

interface SettingsFormProps {
  contact: Record<string, unknown>
  statistics: Record<string, unknown>
  social: Record<string, unknown>
}

export function SettingsForm({ contact, statistics, social }: SettingsFormProps) {
  const [contactData, setContactData] = useState({
    phone: (contact.phone as string) || "",
    email: (contact.email as string) || "",
    whatsapp: (contact.whatsapp as string) || "",
    address: (contact.address as string) || "",
  })

  const [statsData, setStatsData] = useState({
    vehicles_imported: Number(statistics.vehicles_imported) || 0,
    years_experience: Number(statistics.years_experience) || 0,
    average_savings: Number(statistics.average_savings) || 0,
  })

  const [socialData, setSocialData] = useState({
    instagram: (social.instagram as string) || "",
    facebook: (social.facebook as string) || "",
    linkedin: (social.linkedin as string) || "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    setError(null)

    try {
      const supabase = createClient()
      const { error: upsertError } = await supabase.from("site_settings").upsert(
        [
          { key: "contact", value: contactData },
          { key: "statistics", value: statsData },
          { key: "social", value: socialData },
        ],
        { onConflict: "key" }
      )

      if (upsertError) throw upsertError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao guardar"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none"
  const labelClass = "block text-muted-foreground/60 text-sm font-mono mb-2"

  return (
    <div className="space-y-8">
      {/* Contact */}
      <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
        <h2 className="font-display text-2xl text-foreground mb-6">CONTACTOS</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              type="text"
              value={contactData.phone}
              onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={contactData.email}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input
              type="text"
              value={contactData.whatsapp}
              onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Morada</label>
            <input
              type="text"
              value={contactData.address}
              onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
        <h2 className="font-display text-2xl text-foreground mb-6">ESTATÍSTICAS</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Veículos Importados</label>
            <input
              type="number"
              value={statsData.vehicles_imported}
              onChange={(e) => setStatsData({ ...statsData, vehicles_imported: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Anos de Experiência</label>
            <input
              type="number"
              value={statsData.years_experience}
              onChange={(e) => setStatsData({ ...statsData, years_experience: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Poupança Média (%)</label>
            <input
              type="number"
              value={statsData.average_savings}
              onChange={(e) => setStatsData({ ...statsData, average_savings: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
        <h2 className="font-display text-2xl text-foreground mb-6">REDES SOCIAIS</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Instagram</label>
            <input
              type="text"
              value={socialData.instagram}
              onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Facebook</label>
            <input
              type="text"
              value={socialData.facebook}
              onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input
              type="text"
              value={socialData.linkedin}
              onChange={(e) => setSocialData({ ...socialData, linkedin: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saved ? (
          <>
            <Check className="w-5 h-5" />
            Guardado
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {isSaving ? "A guardar..." : "Guardar Alterações"}
          </>
        )}
      </button>
    </div>
  )
}
