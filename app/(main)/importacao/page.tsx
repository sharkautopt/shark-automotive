import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { ImportHero } from '@/components/import/import-hero'
import { ImportProcess } from '@/components/import/import-process'
import { ISVCalculator } from '@/components/import/isv-calculator'
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
        <ISVCalculator />
        <ImportRequestForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
