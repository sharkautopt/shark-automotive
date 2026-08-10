import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { InventoryGrid } from '@/components/inventory/inventory-grid'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Vehicle } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventário | Veículos Premium Disponíveis',
  description: 'Explore o nosso inventário de veículos premium importados da Alemanha e Bélgica. BMW, Mercedes-Benz, Porsche, Audi e muito mais.',
}

interface SearchParams {
  make?: string
  fuel?: string
  minPrice?: string
  maxPrice?: string
  minYear?: string
  maxYear?: string
  sort?: string
}

async function getVehicles(searchParams: SearchParams): Promise<Vehicle[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('vehicles')
    .select('*')
    .in('status', ['available', 'reserved', 'sold'])

  // Apply filters
  if (searchParams.make) {
    query = query.eq('make', searchParams.make)
  }
  if (searchParams.fuel) {
    query = query.eq('fuel_type', searchParams.fuel)
  }
  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice))
  }
  if (searchParams.minYear) {
    query = query.gte('year', parseInt(searchParams.minYear))
  }
  if (searchParams.maxYear) {
    query = query.lte('year', parseInt(searchParams.maxYear))
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'year_desc':
      query = query.order('year', { ascending: false })
      break
    case 'mileage_asc':
      query = query.order('mileage', { ascending: true })
      break
    default:
      query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }

  // Keep sold vehicles at the end, preserving the chosen ordering within each group
  const sorted = (data || []).sort((a, b) => {
    const aSold = a.status === 'sold' ? 1 : 0
    const bSold = b.status === 'sold' ? 1 : 0
    return aSold - bSold
  })

  return sorted
}

async function getFilterOptions() {
  const supabase = await createClient()
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('make, fuel_type')
    .in('status', ['available', 'reserved'])

  const makes = [...new Set(vehicles?.map(v => v.make) || [])].sort()
  const fuels = [...new Set(vehicles?.map(v => v.fuel_type) || [])].sort()

  return { makes, fuels }
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [vehicles, filterOptions] = await Promise.all([
    getVehicles(params),
    getFilterOptions(),
  ])

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Inventário"
              title="VEÍCULOS DISPONÍVEIS"
              description="Todos os veículos passaram pelo nosso Protocolo 150 de inspeção e estão prontos para entrega."
            />
          </div>
        </section>

        {/* Filters and Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {vehicles.length >= 8 && (
              <Suspense fallback={<div className="animate-pulse h-16 bg-card" />}>
                <InventoryFilters
                  makes={filterOptions.makes}
                  fuels={filterOptions.fuels}
                  currentFilters={params}
                />
              </Suspense>
            )}

            <div className={vehicles.length >= 8 ? 'mt-8' : ''}>
              <div className="flex flex-col gap-1 mb-6">
                <p className="font-mono text-sm tracking-wider text-muted-foreground">
                  {vehicles.filter(v => v.status !== 'sold').length} viaturas disponíveis · Novas entradas em breve
                </p>
                <p className="font-mono text-xs tracking-wider text-[#5A7A9A]">
                  Financiamento disponível em todas as viaturas.
                </p>
              </div>

              <InventoryGrid vehicles={vehicles} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
