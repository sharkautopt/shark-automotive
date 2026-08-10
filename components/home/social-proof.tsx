'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'João Silva',
    role: 'Proprietário BMW 330i',
    text: 'Processo transparente do início ao fim. Recebei o veículo exatamente como combinado, com toda a documentação em ordem.',
    rating: 5,
  },
  {
    name: 'Ana Costa',
    role: 'Proprietária Mercedes C-Class',
    text: 'A equipa Shark foi muito profissional. O dossier técnico foi excelente e o suporte durante a importação impecável.',
    rating: 5,
  },
  {
    name: 'Ricardo Oliveira',
    role: 'Proprietário Audi A4 Avant',
    text: 'Melhor experiência de compra de carro que já tive. Absolutamente recomendo a Shark Automotive.',
    rating: 5,
  },
]

export function SocialProof() {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground mb-2">
            O Que Dizem Nossos Clientes
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Centenas de clientes satisfeitos com a qualidade e profissionalismo Shark
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-5 bg-card border border-border/50"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 leading-snug italic text-sm">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-border/50 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="font-display text-4xl md:text-5xl text-primary mb-1">500+</div>
            <p className="text-xs md:text-sm text-muted-foreground">Clientes Satisfeitos</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="font-display text-4xl md:text-5xl text-primary mb-1">4.9/5</div>
            <p className="text-xs md:text-sm text-muted-foreground">Rating Médio</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="font-display text-4xl md:text-5xl text-primary mb-1">8+</div>
            <p className="text-xs md:text-sm text-muted-foreground">Anos de Experiência</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
