'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Clean minimal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary opacity-40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-12"
        >
          <Image
            src="/images/shark-fin-logo.png"
            alt="Shark Automotive"
            width={300}
            height={120}
            className="h-24 w-auto"
            priority
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide text-foreground mb-8"
        >
          SHARK AUTOMOTIVE
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-mono text-base md:text-lg text-muted-foreground tracking-wider mb-12 max-w-2xl mx-auto"
        >
          Importação de Veículos com Transparência Total
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-8 h-12 text-base">
            <Link href="/inventario" className="flex items-center gap-2">
              Ver Inventário
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-foreground text-foreground hover:bg-foreground/10 rounded-none px-8 h-12 text-base bg-transparent">
            <Link href="/importacao">
              Sob Encomenda
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
