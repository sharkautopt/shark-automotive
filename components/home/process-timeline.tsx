'use client'

import { motion } from 'framer-motion'
import { Search, FileCheck, CreditCard, Truck, Key } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const steps = [
  {
    icon: Search,
    title: 'Seleção',
    description: 'Escolha o veículo do nosso inventário ou solicite uma importação personalizada.',
    duration: '1-2 dias',
  },
  {
    icon: FileCheck,
    title: 'Verificação',
    description: 'Inspeção técnica, verificação documental e elaboração do dossier técnico.',
    duration: '3-5 dias',
  },
  {
    icon: CreditCard,
    title: 'Reserva',
    description: 'Reserva do veículo com sinal. Opções de financiamento disponíveis.',
    duration: '1 dia',
  },
  {
    icon: Truck,
    title: 'Transporte',
    description: 'Transporte seguro da Alemanha ou Holanda para Portugal em camião coberto.',
    duration: '5-7 dias',
  },
  {
    icon: Key,
    title: 'Entrega',
    description: 'Legalização completa e entrega do veículo com toda a documentação.',
    duration: '3-5 dias',
  },
]

export function ProcessTimeline() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionHeading
            label="Processo"
            title="COMO FUNCIONA"
            description="Da seleção à entrega, acompanhamos todo o processo para garantir uma experiência sem complicações."
          />
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-auto lg:right-0 w-8 h-8 bg-background border border-primary/30 flex items-center justify-center z-10">
                  <span className="font-mono text-xs text-primary">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-card border border-border/50 mb-6 group-hover:border-primary/30 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl tracking-wide text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {step.description}
                </p>
                <span className="inline-block font-mono text-xs text-primary bg-primary/10 px-3 py-1 ">
                  {step.duration}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
