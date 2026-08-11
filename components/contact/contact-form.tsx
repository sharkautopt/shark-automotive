"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendToMakeWebhookAsync } from "@/lib/webhook"

const inputClasses =
  "w-full px-4 py-3 bg-[#F4F8FC] border border-[#9FADBB] text-[#0E1B2F] placeholder-[#2E6B9E] focus:border-[#0E1B2F] focus:outline-none transition-colors"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
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
        lead_type: "contact",
        message: `[${formData.subject}] ${formData.message}`,
        source: "website_contact",
      })

      if (insertError) throw insertError

      // Send to Make webhook (non-blocking)
      sendToMakeWebhookAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        message: `[${formData.subject}] ${formData.message}`,
      })

      setIsSuccess(true)
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (err) {
      setError("Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.")
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

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-[#2E6B9E] mx-auto mb-6" />
        <h3 className="font-display text-2xl text-foreground mb-2">
          MENSAGEM ENVIADA
        </h3>
        <p className="text-muted-foreground mb-6">
          Entraremos em contacto consigo brevemente.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-[#2E6B9E] hover:text-foreground transition-colors font-mono text-sm underline underline-offset-4"
        >
          ENVIAR NOVA MENSAGEM
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-name" className="block text-muted-foreground text-sm font-mono mb-2">
            NOME *
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="O seu nome"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-muted-foreground text-sm font-mono mb-2">
            EMAIL *
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-phone" className="block text-muted-foreground text-sm font-mono mb-2">
            TELEFONE
          </label>
          <input
            id="contact-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses}
            placeholder="+351 900 000 000"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="block text-muted-foreground text-sm font-mono mb-2">
            ASSUNTO *
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={inputClasses}
          >
            <option value="">Selecione um assunto</option>
            <option value="inventario">Veículo em Stock</option>
            <option value="importacao">Importação Personalizada</option>
            <option value="financiamento">Financiamento</option>
            <option value="parceria">Parceria de Negócio</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-muted-foreground text-sm font-mono mb-2">
          MENSAGEM *
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className={`${inputClasses} resize-none`}
          placeholder="Descreva a sua questão ou pedido..."
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#0E1B2F] text-[#E8E4DC] border border-[#9FADBB] font-display text-xl tracking-wider hover:bg-[#0E1B2F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            A ENVIAR...
          </>
        ) : (
          <>
            ENVIAR MENSAGEM
            <Send className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}
