'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Phone, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ctaCards = [
  {
    icon: FileText,
    title: 'Importação Sob Encomenda',
    description: 'Não encontrou o que procura? Procuramos o veículo perfeito para si na Alemanha ou Holanda.',
    cta: 'Solicitar Importação',
    href: '/importacao',
  },
  {
    icon: Phone,
    title: 'Falar com Consultor',
    description: 'Esclareça todas as suas dúvidas com um dos nossos especialistas em importação.',
    cta: 'Agendar Chamada',
    href: '/contacto',
  },
  {
    icon: Users,
    title: 'Parceria de Negócio',
    description: 'Participa directamente em operações da Shark Automotive. Contratualizado por viatura, sem promessas.',
    cta: 'Saber Mais',
    href: '/parceiros',
  },
]

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 p-8 md:p-12 lg:p-16 mb-12"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-[#5A7A9A] uppercase mb-4">
              Pronto para começar?
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground mb-6">
              O SEU PRÓXIMO VEÍCULO ESTÁ NA EUROPA
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Com a Shark Automotive, importar um veículo premium nunca foi tão simples, 
              transparente e seguro. Deixe-nos tratar de tudo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-none">
                <Link href="/inventario" className="flex items-center gap-2">
                  Explorar Inventário
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[#C8C4BC]/40 hover:bg-foreground/5 rounded-none bg-transparent">
                <Link href="/contacto">
                  Contactar Consultor
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ctaCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={card.href}
                className="group block h-full bg-card/50 backdrop-blur-sm border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <card.icon className="w-6 h-6 text-[#5A7A9A]" />
                </div>
                <h3 className="font-display text-xl tracking-wide text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {card.description}
                </p>
                <span className="inline-flex items-center gap-2 font-mono text-sm text-primary group-hover:gap-3 transition-all">
                  {card.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
