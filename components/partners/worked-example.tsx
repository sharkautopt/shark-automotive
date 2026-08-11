'use client'

import { motion } from 'framer-motion'

const steps = [
  { label: 'Participação inicial', value: '8.000\u20AC', note: 'Contrato individual assinado antes da compra' },
  { label: 'Viatura adquirida', value: 'Hot hatch alemão, 2019', note: 'Leilão fechado, Alemanha' },
  { label: 'Protocolo Shark 150', value: '147/150', note: 'Dossier técnico completo partilhado' },
  { label: 'Ciclo da operação', value: '9 semanas', note: 'Compra \u2192 transporte \u2192 legalização \u2192 venda' },
  { label: 'Resultado partilhado', value: 'Proporcional', note: 'Distribuído conforme a participação contratada' },
]

export function WorkedExample() {
  return (
    <section className="py-16 lg:py-24 border-b border-border/50 bg-card/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-[1px] bg-[#2E6B9E]" />
            <span className="font-mono text-[10px] tracking-[4px] uppercase text-[#2E6B9E]">
              Operação Exemplo
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground text-balance mb-3">
            Como Funciona Na Prática
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Uma operação real, anonimizada. Cada passo foi documentado e partilhado
            com o parceiro ao longo do ciclo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="border border-border/60 divide-y divide-border/60"
        >
          {steps.map((step) => (
            <div
              key={step.label}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-8 items-baseline p-5"
            >
              <div>
                <p className="font-mono text-xs tracking-wider uppercase text-[#2E6B9E] mb-1">
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">{step.note}</p>
              </div>
              <p className="font-display text-2xl text-foreground sm:text-right">
                {step.value}
              </p>
            </div>
          ))}
        </motion.div>

        <p className="mt-6 font-mono text-xs text-muted-foreground leading-relaxed">
          Exemplo ilustrativo baseado numa operação concluída. Resultados passados
          não garantem resultados futuros. Cada operação é definida por contrato
          individual, sem percentagens garantidas.
        </p>
      </div>
    </section>
  )
}
