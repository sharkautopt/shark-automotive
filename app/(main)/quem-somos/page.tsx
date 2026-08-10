import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { AboutHero } from '@/components/about/about-hero'
import { AboutMission } from '@/components/about/about-mission'
import { AboutValues } from '@/components/about/about-values'
import { AboutTeam } from '@/components/about/about-team'
import { CTASection } from '@/components/home/cta-section'

export const metadata: Metadata = {
  title: 'Quem Somos | Shark Automotive',
  description: 'Conheça a Shark Automotive. Importação premium de veículos da Alemanha e Holanda para Portugal com total transparência.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
      <CTASection />
    </main>
    </>
  )
}
