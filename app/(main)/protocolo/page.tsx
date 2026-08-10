import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { ProtocolHero } from '@/components/protocol/protocol-hero'
import { ProtocolSteps } from '@/components/protocol/protocol-steps'
import { ProtocolChecklist } from '@/components/protocol/protocol-checklist'
import { WarrantySection } from '@/components/protocol/warranty-section'
import { AboutTeam } from '@/components/protocol/about-team'

export const metadata: Metadata = {
  title: 'Protocolo Shark 150 | A Nossa Metodologia',
  description: 'Conheça o Protocolo Shark 150: 150 pontos de inspeção, verificação documental completa, garantia e total transparência em cada importação.',
}

export default function ProtocolPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ProtocolHero />
        <ProtocolSteps />
        <ProtocolChecklist />
        <WarrantySection />
        <AboutTeam />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
