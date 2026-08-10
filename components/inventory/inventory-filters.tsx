'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InventoryFiltersProps {
  makes: string[]
  fuels: string[]
  currentFilters: {
    make?: string
    fuel?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }
}

const priceRanges = [
  { label: 'Até 30.000€', min: '0', max: '30000' },
  { label: '30.000€ - 50.000€', min: '30000', max: '50000' },
  { label: '50.000€ - 80.000€', min: '50000', max: '80000' },
  { label: '80.000€ - 120.000€', min: '80000', max: '120000' },
  { label: 'Mais de 120.000€', min: '120000', max: '' },
]

const sortOptions = [
  { value: 'featured', label: 'Destaques' },
  { value: 'price_asc', label: 'Preço: Menor primeiro' },
  { value: 'price_desc', label: 'Preço: Maior primeiro' },
  { value: 'year_desc', label: 'Mais recente' },
  { value: 'mileage_asc', label: 'Menor quilometragem' },
]

export function InventoryFilters({ makes, fuels, currentFilters }: InventoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/inventario?${params.toString()}`)
  }, [router, searchParams])

  const updatePriceRange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all') {
      params.delete('minPrice')
      params.delete('maxPrice')
    } else {
      const range = priceRanges.find(r => `${r.min}-${r.max}` === value)
      if (range) {
        if (range.min) params.set('minPrice', range.min)
        else params.delete('minPrice')
        if (range.max) params.set('maxPrice', range.max)
        else params.delete('maxPrice')
      }
    }
    
    router.push(`/inventario?${params.toString()}`)
  }, [router, searchParams])

  const clearFilters = useCallback(() => {
    router.push('/inventario')
  }, [router])

  const hasActiveFilters = Object.values(currentFilters).some(v => v && v !== 'featured')

  const getCurrentPriceRange = () => {
    const { minPrice, maxPrice } = currentFilters
    if (!minPrice && !maxPrice) return 'all'
    return `${minPrice || '0'}-${maxPrice || ''}`
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-mono tracking-wider uppercase">Filtros</span>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Make Filter */}
          <Select
            value={currentFilters.make || 'all'}
            onValueChange={(value) => updateFilter('make', value)}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as marcas</SelectItem>
              {makes.map((make) => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fuel Filter */}
          <Select
            value={currentFilters.fuel || 'all'}
            onValueChange={(value) => updateFilter('fuel', value)}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue placeholder="Combustível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {fuels.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select
            value={getCurrentPriceRange()}
            onValueChange={updatePriceRange}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue placeholder="Preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer preço</SelectItem>
              {priceRanges.map((range) => (
                <SelectItem key={range.label} value={`${range.min}-${range.max}`}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={currentFilters.sort || 'featured'}
            onValueChange={(value) => updateFilter('sort', value)}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
