'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/ui/section-heading'
import { MapPin, Clock } from 'lucide-react'

const facts = [
  {
    icon: MapPin,
    label: 'Localização',
    value: 'Lisboa, Portugal',
  },
  {
    icon: Clock,
    label: 'Tempo Médio',
    value: '3-4 Semanas',
  },
]

export function AboutTeam() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          label="A Equipa"
          title="ESPECIALISTAS EM IMPORTAÇÃO"
          description="A Shark Automotive é fundada e gerida por Vasco Menezes, com experiência directa no sourcing e importação de veículos no mercado europeu."
          className="mb-8"
        />

        {/* Company registration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-white border border-[#9FADBB] p-6 mb-16"
        >
          <p className="font-mono text-[10px] tracking-[4px] uppercase text-[#2E6B9E] mb-3">
            Registo Comercial
          </p>
          <div className="font-sans text-[13px] leading-relaxed text-[#0E1B2F]">
            <p>ESTIRPESÓBRIA – SOCIEDADE UNIPESSOAL LDA</p>
            <p>NIPC 519473108</p>
            <p>Avenida Luís Bívar 91, Lisboa</p>
            <p>Licença de Comércio e Atividades Aduaneiras Registada</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {facts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 border border-primary/30 mx-auto flex items-center justify-center mb-4">
                <fact.icon className="w-6 h-6 text-[#2E6B9E]" />
              </div>
              <p className="text-[10px] tracking-[3px] uppercase text-primary mb-2">
                {fact.label}
              </p>
              <p className="font-display text-2xl text-foreground">
                {fact.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* What We Include */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-card border border-border/30 p-8 lg:p-12"
        >
          <h3 className="font-mono text-[10px] tracking-[4px] uppercase text-[#2E6B9E] mb-6">
            O Que Incluímos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground font-light">
            <p>Car-Pass Europeu verificado</p>
            <p>Auditoria técnica documentada</p>
            <p>Inspeção B oficial IMT</p>
            <p>Dossier técnico completo</p>
            <p>ISV e legalização tratados</p>
            <p>Preço final sem surpresas</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
