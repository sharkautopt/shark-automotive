'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export function WhatsAppButton() {
  const whatsappNumber = '351910000000'
  const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os vossos veículos.')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0E1B2F] hover:bg-[#13263B] text-[#E8E4DC] border border-[#9FADBB]/40 px-4 py-3 transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
      aria-label="Contactar via WhatsApp"
    >
      <MessageCircle className="w-5 h-5 text-[#2E6B9E]" />
      <span className="hidden sm:inline font-mono text-xs tracking-[2px] uppercase pr-1">
        WhatsApp
      </span>
    </motion.a>
  )
}
