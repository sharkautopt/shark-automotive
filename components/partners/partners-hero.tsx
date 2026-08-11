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
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs tracking-[0.22em] text-primary uppercase mb-6"
          >
            SHARK PARTNERS
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground mb-6"
          >
            FINANCIA STOCK AUTOMÓVEL.
            <span className="text-primary"> PARTILHA OS LUCROS REAIS.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            Sem promessas de rendimentos mágicos ou fundos abstratos. Participa diretamente na compra e revenda de viaturas específicas no mercado europeu com 100% de transparência contratual.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
