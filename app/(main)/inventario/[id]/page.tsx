import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { VehicleGallery } from '@/components/vehicles/vehicle-gallery'
import { VehicleSpecs } from '@/components/vehicles/vehicle-specs'
import { VehicleInquiryForm } from '@/components/vehicles/vehicle-inquiry-form'
import { RelatedVehicles } from '@/components/vehicles/related-vehicles'
import type { Vehicle } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getVehicle(id: string): Promise<Vehicle | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getRelatedVehicles(vehicle: Vehicle): Promise<Vehicle[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('make', vehicle.make)
    .neq('id', vehicle.id)
    .in('status', ['available', 'reserved'])
    .limit(3)

  return data || []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const vehicle = await getVehicle(id)
  
  if (!vehicle) {
    return { title: 'Veículo não encontrado' }
  }

  return {
    title: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
    description: `${vehicle.make} ${vehicle.model} ${vehicle.year} - ${vehicle.power}cv, ${vehicle.mileage.toLocaleString('pt-PT')}km, ${vehicle.fuel_type}. Importado da ${vehicle.country_origin} com inspeção técnica documentada.`,
    openGraph: {
      images: vehicle.photos?.[0] ? [vehicle.photos[0]] : [],
    },
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params
  const vehicle = await getVehicle(id)

  if (!vehicle) {
    notFound()
  }

  const relatedVehicles = await getRelatedVehicles(vehicle)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-foreground transition-colors">Início</a></li>
              <li>/</li>
              <li><a href="/inventario" className="hover:text-foreground transition-colors">Inventário</a></li>
              <li>/</li>
              <li className="text-foreground">{vehicle.make} {vehicle.model}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              <VehicleGallery vehicle={vehicle} />

              {/* Description */}
              {vehicle.description && (
                <div className="bg-card/50 border border-border/50  p-6">
                  <h2 className="font-display text-2xl text-foreground mb-4">Descrição</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {vehicle.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              <VehicleSpecs vehicle={vehicle} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-card/50 border border-border/50  p-6 sticky top-24">
                <div className="mb-6">
                  <span className="font-mono text-xs text-primary tracking-wider uppercase">
                    {vehicle.country_origin}
                  </span>
                  <h1 className="font-display text-3xl text-foreground mt-1">
                    {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {vehicle.year} • {vehicle.mileage.toLocaleString('pt-PT')} km
                  </p>
                </div>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-border/50">
                  <span className="font-display text-4xl text-primary">
                    {formatPrice(vehicle.price)}
                  </span>
                  {vehicle.financing_available && (
                    <span className="text-sm text-muted-foreground">
                      Financiamento disponível
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                {vehicle.status !== 'available' && (
                  <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 ">
                    <span className="text-amber-500 font-medium">
                      {vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
                    </span>
                  </div>
                )}

                {/* Protocol Score */}
                <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20  mb-6">
                  <div>
                    <p className="font-mono text-xs text-primary tracking-wider uppercase">
                      Protocolo Shark
                    </p>
                    <p className="text-sm text-muted-foreground">Inspeção verificada</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-3xl text-primary">
                      {vehicle.protocol_score}
                    </span>
                    <span className="text-primary">/150</span>
                  </div>
                </div>

                {/* Inquiry Form */}
                <VehicleInquiryForm vehicle={vehicle} />
              </div>
            </div>
          </div>

          {/* Related Vehicles */}
          {relatedVehicles.length > 0 && (
            <RelatedVehicles vehicles={relatedVehicles} currentMake={vehicle.make} />
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
