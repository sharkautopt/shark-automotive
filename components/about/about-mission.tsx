'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function AboutMission() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading
              label="A Nossa Missão"
              title="TRANSPARÊNCIA TOTAL"
              align="left"
              className="mb-8"
            />
            
            <div className="space-y-6 text-muted-foreground font-light leading-relaxed">
              <p>
                A Shark Automotive nasceu de uma frustração: o mercado de importação 
                de veículos em Portugal estava repleto de promessas vagas, descrições 
                genéricas e falta de documentação técnica.
              </p>
              <p>
                Criámos o Protocolo 150 para mudar isso. Cada viatura que importamos 
                passa por 150 pontos de verificação documentados, desde diagnóstico 
                OBD completo até verificação de histórico europeu.
              </p>
              <p>
                O resultado é um Dossier Técnico de 18 páginas que acompanha cada 
                veículo. Não é marketing. São dados verificáveis que permitem ao 
                cliente tomar uma decisão informada.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-12"
          >
            <div className="bg-card border border-border/30 p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="border-b border-border/30 pb-8">
                  <span className="font-display text-5xl text-foreground">150</span>
                  <p className="text-[10px] tracking-[3px] uppercase text-muted-foreground mt-2">
                    Pontos de Auditoria
                  </p>
                </div>
                <div className="border-b border-border/30 pb-8">
                  <span className="font-display text-5xl text-foreground">18</span>
                  <p className="text-[10px] tracking-[3px] uppercase text-muted-foreground mt-2">
                    Páginas por Dossier
                  </p>
                </div>
                <div className="pb-4">
                  <span className="font-display text-5xl text-foreground">EU</span>
                  <p className="text-[10px] tracking-[3px] uppercase text-muted-foreground mt-2">
                    Origem Verificada
                  </p>
                </div>
                <div className="pb-4">
                  <span className="font-display text-5xl text-foreground">0</span>
                  <p className="text-[10px] tracking-[3px] uppercase text-muted-foreground mt-2">
                    Custos Ocultos
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
