'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calculator, Clock3, ShieldCheck, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SimulatorForm } from '@/components/import/simulator-form'

const trustStats = [
  { value: '3–6', label: 'semanas até à entrega', icon: Clock3 },
  { value: '0', label: 'custos fora da conta', icon: WalletCards },
  { value: '6', label: 'meses de garantia', icon: ShieldCheck },
]

export function HeroSection() {
  return (
    <section className="border-b border-border/70 px-4 pb-12 pt-28 sm:px-6 lg:px-12 lg:pb-20 lg:pt-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          <span>01</span><span className="h-px flex-1 bg-border" /><span className="text-muted-foreground">Selecionados europeus → Portugal</span>
        </div>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)] lg:gap-16">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <Image src="/images/shark-fin-logo.png" alt="Shark Automotive" width={180} height={68} className="h-9 w-auto object-contain" priority />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Transparência total</span>
            </div>
            <h1 className="max-w-4xl text-balance font-sans text-[clamp(3.25rem,7.5vw,6.5rem)] font-black uppercase leading-[0.88] tracking-[-0.055em] text-foreground">
              Importar custa menos. Aqui está a <span className="text-primary">conta toda</span>.
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Todos dizem que importar é mais barato. Aqui vê a conta antes de falar com alguém — ISV, transporte, legalização e comissão, linha por linha.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-none bg-primary px-7 text-primary-foreground hover:bg-primary/90">
                <Link href="/contacto">Peça o dossier <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-none border-border px-7">
                <Link href="/inventario">Ver viaturas</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
              {trustStats.map((stat) => {
                const Icon = stat.icon
                return <div key={stat.label} className="bg-background p-4 sm:p-5"><Icon className="mb-5 h-4 w-4 text-primary" /><strong className="block font-sans text-3xl font-black tracking-tight text-foreground">{stat.value}</strong><span className="mt-2 block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</span></div>
              })}
            </div>
          </div>
          <div id="calculadora" className="scroll-mt-24 border border-border bg-card p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b-2 border-primary pb-4">
              <div className="flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /><h2 className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Estimativa de custo</h2></div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ficha 01</span>
            </div>
            <SimulatorForm />
          </div>
        </div>
      </div>
    </section>
  )
}
