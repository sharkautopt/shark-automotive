'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Search, Shield, Truck } from 'lucide-react'

const features = [
  { icon: Search, label: 'Pesquisa Personalizada', description: 'Encontramos o veículo exato' },
  { icon: Shield, label: 'Protocolo 25', description: 'Inspeção completa garantida' },
  { icon: Truck, label: 'Entrega Chave-na-Mão', description: 'Tratamos de tudo' },
]

export function ImportHero() {
  return (
    <section className="relative py-24 lg:py-32 border-b border-border/50 overflow-hidden">
      {/* Delivery background photo with navy overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/bts/transporter-luxury-cars.jpg"
          alt="Transportadora carregada com viaturas premium a caminho de Portugal"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(237,234,227,0.55)' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block font-mono text-xs tracking-[0.3em] text-shark-gold uppercase mb-6"
          >
            Importação Sob Encomenda
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground mb-6"
          >
            NÃO ENCONTROU O SEU{' '}
            <span className="text-shark-gold">VEÍCULO IDEAL?</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mb-12 leading-relaxed"
          >
            Procuramos o veículo perfeito para si na Alemanha ou Holanda. 
            Com acesso privilegiado ao mercado Europeu, encontramos exatamente o que procura, 
            com a especificação e orçamento definidos por si.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <div 
                key={feature.label}
                className="flex flex-col items-center p-6 bg-white border border-border/50"
              >
                <div className="w-14 h-14 border border-border/60 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-shark-gold" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-1">{feature.label}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
