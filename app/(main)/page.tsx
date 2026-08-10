import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { HeroSection } from '@/components/home/hero-section'
import { StatsSection } from '@/components/home/stats-section'
import { FeaturedVehicles } from '@/components/home/featured-vehicles'
import { TrustSignals } from '@/components/home/trust-signals'
import { ProtocolSection } from '@/components/home/protocol-section'
import { InsideProcess } from '@/components/home/inside-process'
import { ProcessTimeline } from '@/components/home/process-timeline'
import { SocialProof } from '@/components/home/social-proof'
import { CTASection } from '@/components/home/cta-section'
import type { Vehicle } from '@/lib/types'

async function getFeaturedVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('featured', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }

  return data || []
}

export default async function HomePage() {
  const vehicles = await getFeaturedVehicles()

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        {vehicles.length > 0 && <FeaturedVehicles vehicles={vehicles} />}
        <TrustSignals />
        <ProtocolSection />
        <InsideProcess />
        <ProcessTimeline />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
