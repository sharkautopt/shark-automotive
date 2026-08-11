'use client'

import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings2, 
  Palette, 
  Car, 
  Users, 
  Leaf,
  Shield,
  FileCheck,
  Wrench,
  Award
} from 'lucide-react'
import type { Vehicle } from '@/lib/types'

interface VehicleSpecsProps {
  vehicle: Vehicle
}

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
  const specs = [
    { icon: Calendar, label: 'Ano', value: vehicle.year.toString() },
    { icon: Gauge, label: 'Quilometragem', value: `${vehicle.mileage.toLocaleString('pt-PT')} km` },
    { icon: Fuel, label: 'Combustível', value: vehicle.fuel_type },
    { icon: Settings2, label: 'Potência', value: `${vehicle.power} cv` },
    { icon: Car, label: 'Transmissão', value: vehicle.transmission },
    { icon: Car, label: 'Carroçaria', value: vehicle.body_type || 'N/D' },
    { icon: Palette, label: 'Cor Exterior', value: vehicle.exterior_color || 'N/D' },
    { icon: Palette, label: 'Interior', value: vehicle.interior_color || 'N/D' },
    { icon: Car, label: 'Portas', value: vehicle.doors?.toString() || '4' },
    { icon: Users, label: 'Lugares', value: vehicle.seats?.toString() || '5' },
    { icon: Settings2, label: 'Motor', value: vehicle.engine_size || 'N/D' },
    { icon: Leaf, label: 'Emissões CO2', value: vehicle.co2_emissions ? `${vehicle.co2_emissions} g/km` : 'N/D' },
  ]

  const verifications = [
    { 
      icon: Shield, 
      label: 'Verificação Shark', 
      value: vehicle.inspection_status === 'approved' ? 'Aprovada' : 'Em validação',
      verified: vehicle.inspection_status === 'approved'
    },
    { 
      icon: FileCheck, 
      label: 'Car-Pass', 
      value: vehicle.carpass_status ? 'Verificado' : 'Pendente',
      verified: vehicle.carpass_status
    },
    { 
      icon: Wrench, 
      label: 'Histórico Serviço', 
      value: vehicle.service_history ? 'Completo' : 'Parcial',
      verified: vehicle.service_history
    },
    { 
      icon: Award, 
      label: 'Garantia', 
      value: `${vehicle.warranty_months} meses`,
      verified: true
    },
  ]

  return (
    <div className="space-y-8">
      {/* Technical Specifications */}
      <div className="bg-card/50 border border-border/50 p-6">
        <h2 className="font-display text-2xl text-foreground mb-6">
          Especificações Técnicas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specs.map((spec) => (
            <div 
              key={spec.label}
              className="flex items-start gap-3 p-3 bg-background/50 "
            >
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <spec.icon className="w-5 h-5 text-[#2E6B9E]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{spec.label}</p>
                <p className="font-mono text-sm text-foreground">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verifications */}
      <div className="bg-card/50 border border-border/50 p-6">
        <h2 className="font-display text-2xl text-foreground mb-6">
          Verificações e Garantias
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {verifications.map((item) => (
            <div 
              key={item.label}
              className={`flex items-center gap-4 p-4  border ${
                item.verified 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-amber-500/5 border-amber-500/20'
              }`}
            >
              <div className={`w-12 h-12  flex items-center justify-center ${
                item.verified ? 'bg-green-500/10' : 'bg-amber-500/10'
              }`}>
                <item.icon className={`w-6 h-6 ${
                  item.verified ? 'text-green-500' : 'text-amber-500'
                }`} />
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
                <p className={`font-medium ${
                  item.verified ? 'text-green-500' : 'text-amber-500'
                }`}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIN */}
      {vehicle.vin && (
        <div className="bg-card/50 border border-border/50 p-6">
          <h2 className="font-display text-2xl text-foreground mb-4">
            Identificação do Veículo
          </h2>
          <div className="flex items-center justify-between p-4 bg-background/50 ">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Número de Chassis (VIN)</p>
              <p className="font-mono text-lg tracking-wider">{vehicle.vin}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
