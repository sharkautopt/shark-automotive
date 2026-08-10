'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import type { Vehicle } from '@/lib/types'

interface FeaturedVehiclesProps {
  vehicles: Vehicle[]
}

export function FeaturedVehicles({ vehicles }: FeaturedVehiclesProps) {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <SectionHeading
            label="Inventário"
            title="VEÍCULOS EM DESTAQUE"
            description="Seleção curada de veículos premium já inspecionados e disponíveis para entrega imediata."
            align="left"
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild variant="outline" className="border-[#C8C4BC]/40 hover:bg-foreground/5 rounded-none bg-transparent">
              <Link href="/inventario" className="flex items-center gap-2">
                Ver Todo o Inventário
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div
          className={
            vehicles.length >= 3
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'
          }
        >
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <VehicleCard vehicle={vehicle} featured={index === 0} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
