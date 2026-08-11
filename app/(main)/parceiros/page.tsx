import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { PartnersHero } from '@/components/partners/partners-hero'
import { InvestmentModes } from '@/components/partners/investment-modes'
import { WorkedExample } from '@/components/partners/worked-example'
import { PartnersForm } from '@/components/partners/partners-form'

export const metadata: Metadata = {
  title: 'Shark Partners | Parceria Automóvel Transparente',
  description: 'Invista no mercado automóvel premium com a Shark Automotive. Retornos atrativos, risco controlado, transparência total.',
}

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <PartnersHero />
        <InvestmentModes />
        <WorkedExample />
        <PartnersForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
