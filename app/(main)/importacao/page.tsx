import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { ImportHero } from '@/components/import/import-hero'
import { ImportProcess } from '@/components/import/import-process'
import { SimulatorForm } from '@/components/import/simulator-form'
import { ImportRequestForm } from '@/components/import/import-request-form'

export const metadata: Metadata = {
  title: 'Importação Sob Encomenda | Encontramos o Seu Veículo',
  description: 'Serviço de importação personalizada de veículos premium da Alemanha e Holanda. Processo transparente, inspeção de 150 pontos, documentação completa.',
}

export default function ImportPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ImportHero />
        <ImportProcess />
        <section id="simulador-encomenda" className="bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-primary">Simulador de importação</p>
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">Simule a sua encomenda</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                Cole um anúncio, introduza um URL do Mobile.de ou AutoScout24, ou preencha os dados manualmente.
                O simulador estima o ISV e todos os custos de importação.
              </p>
            </div>
            <SimulatorForm />
          </div>
        </section>
        <ImportRequestForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
