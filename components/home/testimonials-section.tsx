'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Testimonial } from '@/lib/types'

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionHeading
            label="Testemunhos"
            title="O QUE DIZEM OS NOSSOS CLIENTES"
            description="A satisfação dos nossos clientes é a melhor garantia do nosso trabalho."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-card/50 backdrop-blur-sm border border-border/50 p-8 hover:border-primary/30 transition-colors"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6">
                <Quote className="w-10 h-10 text-primary/20" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Testimonial text */}
              <blockquote className="text-foreground/90 leading-relaxed mb-6">
                &ldquo;{testimonial.testimonial}&rdquo;
              </blockquote>

              {/* Client info */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="font-display text-lg text-primary">
                    {testimonial.client_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.client_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{testimonial.client_location}</span>
                    {testimonial.vehicle_purchased && (
                      <>
                        <span className="text-primary">•</span>
                        <span className="font-mono text-xs">{testimonial.vehicle_purchased}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
