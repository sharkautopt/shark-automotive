'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Search, FileCheck, CreditCard, Truck, Key } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Briefing Inicial',
    description: 'Definimos juntos o veículo ideal: marca, modelo, especificações, orçamento máximo e prazo desejado.',
    duration: '1 dia',
  },
  {
    number: '02',
    icon: Search,
    title: 'Pesquisa de Mercado',
    description: 'Procuramos em múltiplas fontes na Alemanha e Holanda, apresentando as melhores opções encontradas.',
    duration: '3-7 dias',
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Verificação & Inspeção',
    description: 'Realizamos uma verificação completa: documentação, Car-Pass e inspeção técnica presencial.',
    duration: '2-3 dias',
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Reserva & Pagamento',
    description: 'Após aprovação, reservamos o veículo com sinal. Opções de financiamento disponíveis.',
    duration: '1 dia',
  },
  {
    number: '05',
    icon: Truck,
    title: 'Transporte',
    description: 'Transporte especializado em camião coberto desde a origem até Portugal com seguro total.',
    duration: '5-7 dias',
  },
  {
    number: '06',
    icon: Key,
    title: 'Legalização & Entrega',
    description: 'Tratamos de toda a documentação: ISV, IUC, matrícula portuguesa. Entrega ao domicílio ou em local acordado.',
    duration: '5-7 dias',
  },
]

export function ImportProcess() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Processo"
          title="COMO FUNCIONA A IMPORTAÇÃO"
          description="Um processo transparente e estruturado, do briefing inicial à entrega das chaves."
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-card/50 border border-border/50 p-6 hover:border-primary/30 transition-colors"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-mono text-sm">
                {step.number}
              </div>

              <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-[#2E6B9E]" />
              </div>

              <h3 className="font-display text-xl text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {step.description}
              </p>

              <span className="inline-block font-mono text-xs text-primary bg-primary/10 px-3 py-1 ">
                {step.duration}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Total Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-primary/10 border border-primary/20 ">
            <span className="text-muted-foreground">Prazo total estimado:</span>
            <span className="font-display text-2xl text-primary">2-4 Semanas</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
