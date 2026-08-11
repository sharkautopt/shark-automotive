'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const examples = [
  {
    request: 'BMW M3 Competition 2022-2023',
    specs: 'Cor azul ou cinza, interior preto, menos de 30.000km',
    budget: 'Até 85.000€',
    result: 'BMW M3 Competition 2023, 18.000km, Cinza Dravit, encontrado em Munique',
    savings: '7.200€',
  },
  {
    request: 'Mercedes GLE 350d AMG Line',
    specs: 'Equipamento completo, histórico oficial, máx. 2 anos',
    budget: 'Até 70.000€',
    result: 'GLE 350d AMG Line 2022, 32.000km, todas as opções, de Berlim',
    savings: '9.500€',
  },
  {
    request: 'Porsche Cayenne E-Hybrid',
    specs: 'Couro claro, teto panorâmico, Sport Chrono',
    budget: 'Até 95.000€',
    result: 'Cayenne E-Hybrid 2022, 25.000km, especificação completa, de Stuttgart',
    savings: '12.000€',
  },
]

export function SourcingExamples() {
  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Casos Reais"
          title="EXEMPLOS DE SOURCING"
          description="Veja alguns exemplos de pesquisas realizadas com sucesso para os nossos clientes."
          className="mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card/50 border border-border/50 overflow-hidden"
            >
              {/* Request */}
              <div className="p-6 border-b border-border/50">
                <span className="font-mono text-xs text-primary tracking-wider uppercase">
                  Pedido do Cliente
                </span>
                <h3 className="font-display text-xl text-foreground mt-2 mb-3">
                  {example.request}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{example.specs}</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Orçamento:</span>{' '}
                  <span className="font-mono text-primary">{example.budget}</span>
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center py-4 bg-primary/5">
                <ArrowRight className="w-6 h-6 text-[#2E6B9E] rotate-90" />
              </div>

              {/* Result */}
              <div className="p-6">
                <span className="font-mono text-xs text-green-500 tracking-wider uppercase">
                  Resultado
                </span>
                <div className="flex items-start gap-3 mt-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{example.result}</p>
                </div>
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 ">
                  <p className="text-sm text-green-500">
                    Poupança vs. concessionário:{' '}
                    <span className="font-mono font-bold">{example.savings}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
