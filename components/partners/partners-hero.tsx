'use client'

import { motion } from 'framer-motion'

export function PartnersHero() {
  return (
    <section className="py-16 lg:py-20 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block font-mono text-xs tracking-[0.3em] text-[#5A7A9A] uppercase mb-6"
          >
            Participe num negócio real.
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground mb-6"
          >
            PARCEIROS DE{' '}
            <span className="text-[#C8C4BC]">NEGÓCIO</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            A Shark Automotive opera em co-participação com parceiros seleccionados. 
            Em cada operação, os parceiros participam directamente no negócio — partilhando 
            custos, riscos e resultados reais. Sem promessas. Sem percentagens garantidas. 
            Um negócio transparente, contratualizado por operação.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
