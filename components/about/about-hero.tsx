'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function AboutHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background photo with navy overlay */}
      <div className="absolute inset-0 bg-surface">
        <Image
          src="/images/bts/interior-driving-bmw.jpg"
          alt="Condução de um BMW importado, bastidores da Shark Automotive"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center]"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(237,234,227,0.55)' }} />
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,151,90,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,151,90,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-[1px] bg-[#2E6B9E]" />
            <span className="font-mono text-[10px] tracking-[4px] uppercase text-[#2E6B9E]">
              Quem Somos
            </span>
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[0.95] mb-6 text-balance">
            Não Pedimos Confiança.
            <br />
            Entregamos Prova.
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
            O mercado de importação está cheio de adjetivos. Nós trocámos os adjetivos 
            por documentos. 150 pontos de auditoria. 18 páginas de prova. Um Car-Pass 
            europeu. Uma inspeção B oficial.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
