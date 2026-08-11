'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, FileCheck, Eye } from 'lucide-react'

const values = [
  { icon: Shield, title: 'Rigor', description: 'Cada veículo passa por 25 pontos de verificação' },
  { icon: FileCheck, title: 'Documentação', description: 'Dossier técnico completo entregue ao cliente' },
  { icon: Eye, title: 'Transparência', description: 'Acesso total a histórico, inspeções e relatórios' },
]

export function ProtocolHero() {
  return (
    <section className="py-24 lg:py-32 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block font-mono text-xs tracking-[0.3em] text-[#2E6B9E] uppercase mb-6"
            >
              A Nossa Metodologia
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground mb-6 text-balance"
            >
              PROTOCOLO{' '}
              <span className="text-[#9FADBB]">{'SHARK\u00A025'}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              O Protocolo Shark 25 é a nossa metodologia proprietária de inspeção e verificação 
              de veículos. Desenvolvido ao longo de 8 anos, garante que cada veículo importado 
              cumpre os mais elevados padrões de qualidade e transparência.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block p-4 border border-border/60"
            >
              <p className="font-display text-2xl text-foreground mb-1">
                Zero Conversas. Total Transparência.
              </p>
              <p className="text-sm text-muted-foreground">
                O nosso compromisso em cada importação.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Link
                href="/contacto"
                className="font-mono text-sm tracking-wider text-[#2E6B9E] hover:text-foreground transition-colors underline underline-offset-4"
              >
                {'Peça um exemplo de Dossier Técnico \u2192'}
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="flex items-start gap-4 p-6 bg-card/50 border border-border/50"
              >
                <div className="w-12 h-12 border border-border/60 flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-6 h-6 text-[#2E6B9E]" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground mb-1">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
