'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function AboutTeam() {
  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            label="Sobre Nós"
            title="QUEM SOMOS"
            className="mb-12"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <p className="text-muted-foreground leading-relaxed mb-6">
              A Shark Automotive nasceu em 2023 da paixão pelo automóvel e da frustração com a 
              falta de transparência no mercado de importação em Portugal. Fundada por Vasco Menezes, 
              com experiência directa no mercado automóvel Europeu, a empresa rapidamente se 
              estabeleceu como referência na importação de veículos premium.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              O nosso diferencial é simples: tratamos cada veículo como se fosse para nós próprios. 
              Desenvolvemos o Protocolo 150 precisamente porque acreditamos que os nossos clientes 
              merecem toda a informação antes de tomar uma decisão de compra.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              Hoje, com um processo rigoroso e uma postura de total transparência, 
              continuamos comprometidos com a nossa missão original: tornar a importação de 
              veículos premium uma experiência transparente, segura e sem surpresas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          >
            <div className="p-6 bg-card/50 border border-border/50 ">
              <span className="font-display text-4xl text-primary block mb-1">2023</span>
              <span className="text-sm text-muted-foreground">Ano de Fundação</span>
            </div>
            <div className="p-6 bg-card/50 border border-border/50 ">
              <span className="font-display text-4xl text-primary block mb-1">100%</span>
              <span className="text-sm text-muted-foreground">Documentação Verificada</span>
            </div>
            <div className="p-6 bg-card/50 border border-border/50 ">
              <span className="font-display text-4xl text-primary block mb-1">150</span>
              <span className="text-sm text-muted-foreground">Pontos de Inspeção</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
