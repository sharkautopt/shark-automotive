'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock3, ShieldCheck } from 'lucide-react'

interface StatItem {
  icon: typeof Calendar
  value: string
  label: string
  description: string
}

const stats: StatItem[] = [
  {
    icon: Calendar,
    value: '2023',
    label: 'Ano de Fundação',
    description: 'Shark Automotive',
  },
  {
    icon: Clock3,
    value: '3-4',
    label: 'Semanas',
    description: 'Tempo médio de entrega',
  },
  {
    icon: ShieldCheck,
    value: '0',
    label: 'Custos ocultos',
    description: 'Total transparência',
  },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
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
                <stat.icon className="w-6 h-6 text-[#2E6B9E]" />
              </div>
              <div className="mb-2">
                <span className="font-display text-5xl md:text-6xl text-[#E8E4DC]">
                  {stat.value}
                </span>
              </div>
              <h3 className="font-mono text-sm tracking-wider text-[#2E6B9E] uppercase mb-1">
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
