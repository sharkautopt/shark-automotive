'use client'

import { motion } from 'framer-motion'
import { Shield, Phone } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'

const warrantyFeatures = [
  {
    icon: Shield,
    title: 'Garantia 6 Meses',
    description: 'Cobertura de motor, transmissão e sistemas eletrónicos principais, com responsabilidade máxima de 500€.',
  },
  {
    icon: Phone,
    title: 'Apoio Pós-Venda',
    description: 'Acompanhamento contínuo e apoio para qualquer questão após a compra.',
  },
]

export function WarrantySection() {
  return (
    <section className="py-24 lg:py-32" id="garantia">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              label="Pós-Venda"
              title="GARANTIA SHARK"
              description="A nossa responsabilidade não termina na entrega. Oferecemos garantia real e apoio contínuo."
              align="left"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 p-6 bg-primary/10 border border-primary/20 "
            >
              <h3 className="font-display text-xl text-foreground mb-4">O que está incluído:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Motor e componentes internos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Caixa de velocidades e diferencial
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Sistema de injeção e turbo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Sistemas eletrónicos principais
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Ar condicionado e climatização
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {warrantyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card/50 border border-border/50 p-6"
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#5A7A9A]" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
