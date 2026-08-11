'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Fuel, Gauge, Settings2, Calendar, MapPin, FileDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

interface VehicleCardProps {
  vehicle: Vehicle
  featured?: boolean
  className?: string
}

export function VehicleCard({ vehicle, featured = false, className }: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-PT').format(mileage)
  }

  const isSold = vehicle.status === 'sold'

  return (
    <motion.div
      className={cn(
        'group relative bg-card overflow-hidden border border-border/50 hover:border-[#C8C4BC]/40 transition-all duration-500',
        featured && 'lg:col-span-2 lg:row-span-2',
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Link href={`/inventario/${vehicle.id}`} className="block">
        {/* Image Container */}
        <div className={cn(
          'relative overflow-hidden bg-secondary/30',
          featured ? 'aspect-[16/10]' : 'aspect-[4/3]'
        )}>
          {vehicle.photos && vehicle.photos.length > 0 ? (
            <Image
              src={vehicle.photos[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className={cn(
                'object-cover transition-transform duration-700 group-hover:scale-105',
                isSold && '[filter:grayscale(60%)]'
              )}
              sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
              <span className="text-muted-foreground font-mono text-sm">Sem imagem</span>
            </div>
          )}
          
          {/* Sold navy tint */}
          {isSold && (
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(13,27,42,0.35)' }} />
          )}

          {/* Status Badge */}
          {vehicle.status !== 'available' && (
            <div className="absolute top-4 left-4">
              <span className={cn(
                'px-3 py-1 text-xs font-mono uppercase tracking-wider',
                vehicle.status === 'reserved' && 'bg-[#0D1B2A] text-[#C8C4BC] border border-[#C8C4BC]/40',
                vehicle.status === 'sold' && 'bg-[#0D1B2A] text-[#E8E4DC] border border-[#C8C4BC]/40'
              )}>
                {vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
              </span>
            </div>
          )}

          {/* Monthly price — configured per vehicle in the admin dashboard. */}
          {vehicle.monthly_price != null && vehicle.monthly_price > 0 && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-2 text-right leading-none">
              <span className="block font-mono text-[10px] uppercase tracking-wider opacity-80">Desde</span>
              <span className="block font-display text-lg mt-1">{Math.round(vehicle.monthly_price)}€/mês</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title & Origin */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className={cn(
                'font-display tracking-wide text-foreground',
                featured ? 'text-2xl' : 'text-xl'
              )}>
                {vehicle.make} {vehicle.model}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-[#5A7A9A]" />
                <span className="text-xs text-muted-foreground font-mono">
                  {vehicle.country_origin}
                </span>
              </div>
            </div>
            <div className="text-right">
              {isSold ? (
                <p className={cn(
                  'font-display text-[#C8C4BC]',
                  featured ? 'text-2xl' : 'text-xl'
                )}>
                  VENDIDO
                </p>
              ) : (
                <p className={cn(
                  'font-display text-primary',
                  featured ? 'text-2xl' : 'text-xl'
                )}>
                  {formatPrice(vehicle.price)}
                </p>
              )}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border/50">
            <div className="flex flex-col items-center text-center min-w-0">
              <Calendar className="w-4 h-4 text-[#5A7A9A] mb-1" />
              <span className="text-[11px] text-muted-foreground">Ano</span>
              <span className="font-mono text-xs">{vehicle.year}</span>
            </div>
            <div className="flex flex-col items-center text-center min-w-0">
              <Gauge className="w-4 h-4 text-[#5A7A9A] mb-1" />
              <span className="text-[11px] text-muted-foreground">Km</span>
              <span className="font-mono text-xs">{formatMileage(vehicle.mileage)}</span>
            </div>
            <div className="flex flex-col items-center text-center min-w-0">
              <Fuel className="w-4 h-4 text-[#5A7A9A] mb-1" />
              <span className="text-[11px] text-muted-foreground">Combustível</span>
              <span className="font-mono text-xs">{vehicle.fuel_type}</span>
            </div>
            <div className="flex flex-col items-center text-center min-w-0">
              <Settings2 className="w-4 h-4 text-[#5A7A9A] mb-1" />
              <span className="text-[11px] text-muted-foreground">Potência</span>
              <span className="font-mono text-xs">{vehicle.power} cv</span>
            </div>
          </div>

          {/* Car-Pass Badge */}
          {vehicle.carpass_status && (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-[#5A7A9A]" />
              <span>Car-Pass Verificado</span>
            </div>
          )}
        </div>
      </Link>

      {/* Download ficha (window sticker) */}
      <a
        href={`/api/vehicles/${vehicle.id}/ficha`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center gap-2 mx-5 mb-5 py-2.5 border border-border/60 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-300"
      >
        <FileDown className="w-3.5 h-3.5" />
        Descarregar Ficha
      </a>
    </motion.div>
  )
}
