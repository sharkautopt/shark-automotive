'use client'

import { motion } from 'framer-motion'
import { Car, FileCheck, ShieldCheck, Percent } from 'lucide-react'

interface StatItem {
  icon: typeof Car
  value: string
  label: string
  description: string
}

const stats: StatItem[] = [
  {
    icon: Car,
    value: '3',
    label: 'Viaturas em Stock',
    description: 'Verificadas 25 Pontos',
  },
  {
    icon: FileCheck,
    value: '100%',
    label: 'Documentação Confirmada',
    description: 'Historial validado',
  },
  {
    icon: ShieldCheck,
    value: 'ZERO',
    label: 'Surpresas',
    description: 'Total transparência',
  },
  {
    icon: Percent,
    value: '15%',
    label: 'Poupança Média',
    description: 'Face a concessionários',
  },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 border border-border/60 mb-4">
                <stat.icon className="w-6 h-6 text-[#5A7A9A]" />
              </div>
              <div className="mb-2">
                <span className="font-display text-5xl md:text-6xl text-[#E8E4DC]">
                  {stat.value}
                </span>
              </div>
              <h3 className="font-mono text-sm tracking-wider text-[#5A7A9A] uppercase mb-1">
                {stat.label}
              </h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
