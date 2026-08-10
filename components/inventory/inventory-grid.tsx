'use client'

import { motion } from 'framer-motion'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import type { Vehicle } from '@/lib/types'

interface InventoryGridProps {
  vehicles: Vehicle[]
}

export function InventoryGrid({ vehicles }: InventoryGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-card border border-border/50 flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-3xl text-primary">0</span>
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2">
          Nenhum veículo encontrado
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Não encontrámos veículos com os filtros selecionados. 
          Experimente ajustar os critérios ou contacte-nos para uma pesquisa personalizada.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle, index) => (
        <motion.div
          key={vehicle.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <VehicleCard vehicle={vehicle} />
        </motion.div>
      ))}
    </div>
  )
}
