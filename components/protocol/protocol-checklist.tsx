'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const checklistCategories = [
  {
    title: 'Documentação',
    items: [
      'VIN verificado e correspondente',
      'Car-Pass verificado',
      'Histórico de serviço oficial',
      'Sem recalls pendentes',
      'Documentos originais completos',
    ],
  },
  {
    title: 'Motor & Transmissão',
    items: [
      'Sem fugas de óleo',
      'Arranque normal',
      'Sem ruídos anormais',
      'Transmissão suave',
      'Embraiagem operacional',
    ],
  },
  {
    title: 'Carroçaria & Pintura',
    items: [
      'Pintura original verificada',
      'Sem sinais de colisão',
      'Painéis alinhados',
      'Sem corrosão visível',
      'Vidros originais',
    ],
  },
  {
    title: 'Interior',
    items: [
      'Desgaste compatível com km',
      'Eletrónicos funcionais',
      'AC operacional',
      'Sem odores anormais',
      'Equipamento completo',
    ],
  },
  {
    title: 'Segurança',
    items: [
      'Travões verificados',
      'Airbags operacionais',
      'ABS/ESP funcionais',
      'Pneus conformes',
      'Luzes operacionais',
    ],
  },
  {
    title: 'Teste Dinâmico',
    items: [
      'Direção precisa',
      'Travagem eficaz',
      'Sem vibrações',
      'Consumo normal',
      'Temperatura estável',
    ],
  },
]

export function ProtocolChecklist() {
  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Checklist"
          title="PONTOS DE VERIFICAÇÃO"
          description="Visão geral dos principais critérios avaliados em cada inspeção."
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklistCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card/50 border border-border/50 p-6"
            >
              <h3 className="font-display text-lg text-foreground mb-4 pb-4 border-b border-border/50">
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
