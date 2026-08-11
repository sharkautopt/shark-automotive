'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Shield, 
  FileSearch, 
  Wrench, 
  FileText, 
  Truck, 
  Award,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'

const protocolSteps = [
  {
    icon: FileSearch,
    number: '01',
    title: 'Verificação Documental',
    description: 'Análise completa do histórico, quilometragem real, sinistros, e situação legal do veículo.',
    points: ['Car-Pass', 'Histórico de manutenção', 'Verificação VIN'],
  },
  {
    icon: Wrench,
    number: '02',
    title: 'Inspeção Técnica',
    description: 'Avaliação mecânica detalhada por técnicos qualificados.',
    points: ['Motor e transmissão', 'Suspensão e travões', 'Sistemas eletrónicos'],
  },
  {
    icon: FileText,
    number: '03',
    title: 'Dossier Técnico',
    description: 'Relatório completo com fotografias, vídeos e documentação de cada ponto inspecionado.',
    points: ['Relatório fotográfico', 'Vídeo 360°', 'Documentação completa'],
  },
  {
    icon: Truck,
    number: '04',
    title: 'Transporte Seguro',
    description: 'Transporte especializado em porta-carros cobertos desde a origem até Portugal.',
    points: ['Seguro total', 'Rastreamento GPS', 'Entrega ao domicílio'],
  },
  {
    icon: Award,
    number: '05',
    title: 'Legalização',
    description: 'Tratamos de toda a documentação: ISV, IUC, matrícula e registo português.',
    points: ['Cálculo ISV', 'Matrícula portuguesa', 'Documentos DGV'],
  },
  {
    icon: Shield,
    number: '06',
    title: 'Garantia Shark',
    description: 'Garantia de 6 meses cobrindo motor, transmissão e sistemas principais.',
    points: ['Garantia 6 meses', 'Assistência 24h', 'Rede oficinas parceiras'],
  },
]

export function ProtocolSection() {
  return (
    <section className="relative py-24 lg:py-32 border-y border-border/50 overflow-hidden">
      {/* Inspection background photo with navy overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/bts/mercedes-eqs-inspection-ramp.jpg"
          alt="Mercedes EQS sobre rampa de inspeção técnica"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14, 27, 47,0.80)' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionHeading
            label="O Nosso Método"
            title="VERIFICAÇÃO SHARK"
            description="Um processo rigoroso de inspeção e documentação que reforça a qualidade e transparência de cada veículo importado."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {protocolSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
            >
              {/* Number badge */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="font-mono text-sm text-primary">{step.number}</span>
              </div>

              <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-[#2E6B9E]" />
              </div>

              <h3 className="font-display text-xl tracking-wide text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {step.description}
              </p>

              <ul className="space-y-2">
                {step.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[#2E6B9E] flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
            <Link href="/contacto" className="flex items-center gap-2">
              Pedir dossier técnico
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
