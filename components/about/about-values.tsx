'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/ui/section-heading'
import { FileCheck, Shield, Eye, Zap } from 'lucide-react'

const values = [
  {
    icon: FileCheck,
    title: 'Documentação',
    description: 'Cada viatura vem com um Dossier Técnico completo de 18 páginas. Não há descrições vagas, apenas dados verificáveis.',
  },
  {
    icon: Shield,
    title: 'Proteção',
    description: 'Garantia incluída, inspeção B oficial, e um protocolo de 150 pontos que assegura a qualidade de cada veículo.',
  },
  {
    icon: Eye,
    title: 'Transparência',
    description: 'Preço final sem surpresas. ISV calculado. Todos os custos discriminados antes de qualquer compromisso.',
  },
  {
    icon: Zap,
    title: 'Eficiência',
    description: 'Processo simplificado de importação. Tratamos de toda a documentação, transporte e legalização.',
  },
]

export function AboutValues() {
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          label="Os Nossos Valores"
          title="PRINCÍPIOS FUNDAMENTAIS"
          description="Os pilares que orientam cada decisão na Shark Automotive."
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border/30 p-8 group hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-12 h-12 border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                <value.icon className="w-5 h-5 text-[#2E6B9E]" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
