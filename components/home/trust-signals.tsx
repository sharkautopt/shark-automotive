'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, FileCheck, BarChart3, Headphones } from 'lucide-react'

const signals = [
  {
    icon: ShieldCheck,
    title: 'Inspeção Completa',
    description: 'Verificação técnica por profissionais qualificados',
  },
  {
    icon: FileCheck,
    title: 'Documentação Verificada',
    description: '100% dos documentos validados e autenticados',
  },
  {
    icon: BarChart3,
    title: 'Transparência Total',
    description: 'Acesso a todos os relatórios e históricos do veículo',
  },
  {
    icon: Headphones,
    title: 'Apoio Dedicado',
    description: 'Suporte 24h durante todo o processo de importação',
  },
]

export function TrustSignals() {
  return (
    <section className="py-12 bg-card/50 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground mb-2">
            Por Que Confiar em Nós
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Segurança, transparência e profissionalismo em cada importação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4 bg-background border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mb-3">
                <signal.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base text-foreground mb-1">
                {signal.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-tight">
                {signal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
