"use client"

import { useState } from "react"
import { X, Loader2, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendToMakeWebhookAsync } from "@/lib/webhook"

interface SimulatorInquiryModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleData?: Record<string, any> | null
  estimatedCost?: number
}

export function SimulatorInquiryModal({
  isOpen,
  onClose,
  vehicleData,
  estimatedCost,
}: SimulatorInquiryModalProps) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Por favor, indique um email")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const vehicleDesc = vehicleData
        ? `${vehicleData.make} ${vehicleData.model} (${vehicleData.year})`
        : "Simulador de Importação"

      const { error: insertError } = await supabase.from("leads").insert({
        email: email.trim(),
        phone: phone.trim() || null,
        lead_type: "simulator_inquiry",
        message: `Simulador: ${vehicleDesc} - Orçamento estimado: €${estimatedCost?.toLocaleString("pt-PT")}`,
        source: "website_simulator",
      })

      if (insertError) throw insertError

      // Send to Make webhook (non-blocking)
      sendToMakeWebhookAsync({
        email: email.trim(),
        phone: phone.trim() || "",
        message: `[SIMULADOR] ${vehicleDesc} - Orçamento estimado: €${estimatedCost?.toLocaleString("pt-PT")}`,
      })

      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setEmail("")
        setPhone("")
        setIsSuccess(false)
      }, 2000)
    } catch (err) {
      console.error(err)
      setError("Erro ao enviar. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-shark-navy border border-shark-gold/20 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bebas text-2xl text-shark-silver tracking-wide">
            {isSuccess ? "ENVIADO COM SUCESSO!" : "GOSTOU DO QUE VIU?"}
          </h2>
          {!isSuccess && (
            <button
              onClick={onClose}
              className="text-shark-silver/50 hover:text-shark-silver transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-12 h-12 text-shark-gold mx-auto" />
            <p className="text-shark-silver text-sm">
              Obrigado! Entraremos em contacto em menos de 24h com uma proposta formal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-shark-silver/70 text-sm mb-6">
              Deixe aqui o seu email e telefone. Entramos em contacto com proposta formal em menos de 24h.
            </p>

            <div>
              <label className="block text-shark-silver/60 text-xs font-mono mb-2">
                EMAIL *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder="seu@email.com"
                className="w-full bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-2 text-shark-silver placeholder-shark-silver/30 text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-shark-silver/60 text-xs font-mono mb-2">
                TELEFONE
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+351 900 000 000"
                className="w-full bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-2 text-shark-silver placeholder-shark-silver/30 text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-shark-gold hover:bg-shark-gold-light text-shark-navy disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-mono text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ENVIANDO...
                </>
              ) : (
                "ENVIAR"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
