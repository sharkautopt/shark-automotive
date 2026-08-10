'use client'

import { motion } from 'framer-motion'
import { VehicleCard } from './vehicle-card'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Vehicle } from '@/lib/types'

interface RelatedVehiclesProps {
  vehicles: Vehicle[]
  currentMake: string
}

export function RelatedVehicles({ vehicles, currentMake }: RelatedVehiclesProps) {
  return (
    <section className="mt-16 pt-16 border-t border-border/50">
      <SectionHeading
        label="Pode também gostar"
        title={`MAIS VEÍCULOS ${currentMake.toUpperCase()}`}
        align="left"
        className="mb-8"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <VehicleCard vehicle={vehicle} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
