'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const investmentModes = [
  {
    name: 'Participação Passiva',
    tagline: 'Tu entras com o capital para a viatura. A Shark Auto gere todo o ciclo operacional — sourcing B2B, transporte, legalização, detalhe e venda retail.',
    featured: true,
    features: [
      'Contrato por viatura',
      'Zero envolvimento operacional ou burocrático',
      'Recebes capital + lucro diretamente na venda',
      'Acesso ao dossier financeiro completo',
    ],
  },
  {
    name: 'Participação Activa',
    tagline: 'Ideal para quem quer acompanhar de perto e aprender a dinâmica do mercado automóvel B2B.',
    featured: false,
    features: [
      'Contrato por viatura',
      'Acesso em tempo real aos leilões B2B europeus',
      'Co-decisão no modelo e pricing de venda',
      'Transparência total de margens e custos',
    ],
  },
]

export function InvestmentModes() {
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          label="Modelos de Participação"
          title="COMO PARTICIPAR"
          description="Duas formas de participar nas operações da Shark. Cada operação é contratualizada individualmente por viatura."
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {investmentModes.map((mode, index) => (
            <motion.div
              key={mode.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card border p-12 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 ${
                mode.featured ? 'border-primary/30' : 'border-border/30'
              }`}
            >
              {/* Mode Name */}
              <h3 className="font-display text-4xl text-foreground mb-2">
                {mode.name}
              </h3>
              
              {/* Tagline */}
              <p className="text-sm text-muted-foreground font-light mb-8 leading-relaxed">
                {mode.tagline}
              </p>
              
              {/* Features */}
              <div className="space-y-3">
                {mode.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 text-sm text-steel"
                  >
                    <Check className="w-4 h-4 text-[#2E6B9E] flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
