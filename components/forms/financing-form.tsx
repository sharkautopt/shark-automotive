"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendToMakeWebhookAsync } from "@/lib/webhook"

interface FinancingFormProps {
  vehicleId?: string
  vehicleName?: string
  vehiclePrice?: number
}

export function FinancingForm({ vehicleId, vehicleName, vehiclePrice }: FinancingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    financingAmount: vehiclePrice?.toString() || "",
    downPayment: "",
    term: "60",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: insertError } = await supabase.from("leads").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        lead_type: "financing",
        vehicle_id: vehicleId || null,
        financing_amount: parseFloat(formData.financingAmount) || null,
        message: `Entrada: ${formData.downPayment}€ | Prazo: ${formData.term} meses | ${vehicleName ? `Veículo: ${vehicleName}` : ""} | Notas: ${formData.message}`,
        source: "website_financing",
      })

      if (insertError) throw insertError

      // Send to Make webhook (non-blocking)
      sendToMakeWebhookAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        budget_range: `${formData.financingAmount}€`,
        preferred_vehicle_type: vehicleName || "",
        message: `Financiamento: ${formData.financingAmount}€ | Entrada: ${formData.downPayment}€ | Prazo: ${formData.term} meses | ${formData.message}`,
      })

      setIsSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        financingAmount: "",
        downPayment: "",
        term: "60",
        message: "",
      })
    } catch (err) {
      setError("Ocorreu um erro ao enviar o pedido. Por favor, tente novamente.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Calculate estimated monthly payment
  const calculateMonthly = () => {
    const amount = parseFloat(formData.financingAmount) - parseFloat(formData.downPayment || "0")
    const months = parseInt(formData.term)
    const rate = 0.059 / 12 // 5.9% annual rate
    if (amount > 0 && months > 0) {
      const monthly = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
      return monthly.toFixed(0)
    }
    return "---"
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-shark-gold mx-auto mb-6" />
        <h3 className="font-bebas text-2xl text-shark-silver mb-2">
          PEDIDO RECEBIDO
        </h3>
        <p className="text-shark-silver/60 mb-6">
          Um dos nossos consultores financeiros entrará em contacto em breve.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-shark-gold hover:text-shark-gold-light transition-colors font-mono text-sm"
        >
          FAZER NOVO PEDIDO
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {vehicleName && (
        <div className="p-4 bg-shark-gold/10 border border-shark-gold/20 mb-6">
          <span className="text-shark-gold font-mono text-sm">VEÍCULO SELECIONADO</span>
          <p className="text-shark-silver font-bebas text-xl mt-1">{vehicleName}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            NOME *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
            placeholder="O seu nome"
          />
        </div>
        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            EMAIL *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-shark-silver/70 text-sm font-mono mb-2">
          TELEFONE *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
          placeholder="+351 900 000 000"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            VALOR A FINANCIAR *
          </label>
          <input
            type="number"
            name="financingAmount"
            value={formData.financingAmount}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
            placeholder="50000"
          />
        </div>
        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            ENTRADA
          </label>
          <input
            type="number"
            name="downPayment"
            value={formData.downPayment}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
            placeholder="10000"
          />
        </div>
        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            PRAZO (MESES)
          </label>
          <select
            name="term"
            value={formData.term}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver focus:border-shark-gold focus:outline-none transition-colors"
          >
            <option value="24">24 meses</option>
            <option value="36">36 meses</option>
            <option value="48">48 meses</option>
            <option value="60">60 meses</option>
            <option value="72">72 meses</option>
            <option value="84">84 meses</option>
            <option value="96">96 meses</option>
          </select>
        </div>
      </div>

      {/* Monthly estimate */}
      <div className="p-4 bg-shark-navy-light/30 border border-shark-gold/20 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-shark-gold" />
            <span className="text-shark-silver/70 font-mono text-sm">ESTIMATIVA MENSAL</span>
          </div>
          <div className="text-right">
            <span className="text-shark-gold font-bebas text-3xl">{calculateMonthly()}€</span>
            <span className="text-shark-silver/50 text-sm block">TAN 5.9% (exemplo)</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-shark-silver/70 text-sm font-mono mb-2">
          OBSERVAÇÕES
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors resize-none"
          placeholder="Informações adicionais..."
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-shark-gold text-shark-navy font-bebas text-xl tracking-wider hover:bg-shark-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            A ENVIAR...
          </>
        ) : (
          <>
            SOLICITAR SIMULAÇÃO
            <Calculator className="w-5 h-5" />
          </>
        )}
      </motion.button>

      <p className="text-shark-silver/40 text-xs text-center">
        A simulação apresentada é meramente indicativa. As condições finais dependem 
        da análise de crédito e podem variar.
      </p>
    </form>
  )
}
