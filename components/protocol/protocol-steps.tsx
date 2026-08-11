'use client'

import { motion } from 'framer-motion'
import { FileSearch, Car, Wrench, Camera, FileText, Shield } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const steps = [
  {
    icon: FileSearch,
    title: 'Verificação Documental',
    points: 25,
    description: 'Análise completa de toda a documentação do veículo.',
    items: [
      'Verificação VIN e correspondência chassis',
      'Histórico de proprietários',
      'Verificação de sinistros e recalls',
      'Car-Pass (histórico de quilometragem)',
      'Documentos de manutenção oficial',
    ],
  },
  {
    icon: Car,
    title: 'Inspeção Exterior',
    points: 35,
    description: 'Avaliação detalhada de toda a carroçaria e estrutura.',
    items: [
      'Medição de espessura de pintura',
      'Verificação de painéis e alinhamento',
      'Inspeção de vidros e borrachas',
      'Estado dos faróis e óticas',
      'Verificação de corrosão e ferrugem',
    ],
  },
  {
    icon: Wrench,
    title: 'Inspeção Mecânica',
    points: 45,
    description: 'Verificação completa de todos os sistemas mecânicos.',
    items: [
      'Motor: estado, ruídos, fugas',
      'Transmissão e embraiagem',
      'Sistema de travagem',
      'Suspensão e direção',
      'Sistema de arrefecimento',
    ],
  },
  {
    icon: Camera,
    title: 'Documentação Visual',
    points: 20,
    description: 'Registo fotográfico e em vídeo completo.',
    items: [
      'Fotografias HD exteriores (50+)',
      'Fotografias HD interiores (30+)',
      'Vídeo 360° do veículo',
      'Documentação de detalhes e defeitos',
      'Registo do painel e quilometragem',
    ],
  },
  {
    icon: FileText,
    title: 'Teste em Estrada',
    points: 15,
    description: 'Avaliação dinâmica do comportamento do veículo.',
    items: [
      'Comportamento em aceleração',
      'Teste de travagem',
      'Ruídos e vibrações',
      'Funcionamento eletrónico',
      'Consumos e temperatura',
    ],
  },
  {
    icon: Shield,
    title: 'Checklist Final',
    points: 10,
    description: 'Validação final de todos os pontos de inspeção.',
    items: [
      'Confirmação de todos os pontos',
      'Score final do protocolo',
      'Aprovação/Recomendações',
      'Assinatura do técnico responsável',
      'Certificado de inspeção Shark',
    ],
  },
]

export function ProtocolSteps() {
  return (
    <section className="py-24 lg:py-32" id="protocolo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Verificação Shark"
          title="AS 6 FASES DE VERIFICAÇÃO"
          description="Cada veículo passa por 6 fases de inspeção rigorosa, com todos os resultados documentados."
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card/50 border border-border/50 overflow-hidden"
            >
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-[#2E6B9E]" />
                  </div>
                  <div className="text-right">
                    <span className="font-display text-3xl text-primary">{step.points}</span>
                    <span className="text-sm text-muted-foreground block">pontos</span>
                  </div>
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {step.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
