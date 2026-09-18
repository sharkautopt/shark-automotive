'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { Operation } from '@/lib/types'
import { updateOperationVehicleSpec, type VehicleSpecInput } from '@/app/admin/operacoes/actions'

const fieldClass =
  'w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none'
const labelClass = 'block text-muted-foreground/70 text-sm font-mono mb-2'

// Full vehicle spec for an operation, filled in once the car is actually
// sourced. This is the single source of truth the whole document suite
// (Contrato, Procuração, Declaração de Circulação/Entrega, Orçamento de
// Importação) reads from — fill it once here, every document auto-fills.
export function OperationVehicleSpec({ operation }: { operation: Operation }) {
  const [spec, setSpec] = useState<VehicleSpecInput>({
    make: operation.vehicle_make ?? '',
    model: operation.vehicle_model ?? '',
    year: operation.vehicle_year ?? undefined,
    km: operation.vehicle_km ?? undefined,
    colour: operation.vehicle_colour ?? '',
    plate: operation.vehicle_plate ?? '',
    foreignPlate: operation.vehicle_foreign_plate ?? '',
    nationalRegistrationDate: operation.vehicle_national_registration_date ?? '',
    categoria: operation.vehicle_categoria ?? '',
    taraKg: operation.vehicle_tara_kg ?? undefined,
    pesoBrutoKg: operation.vehicle_peso_bruto_kg ?? undefined,
    vin: operation.vehicle_vin ?? '',
    countryOrigin: operation.vehicle_country_origin ?? '',
    fuelType: operation.vehicle_fuel_type ?? '',
    power: operation.vehicle_power ?? undefined,
    engineSize: operation.vehicle_engine_size ?? '',
    doors: operation.vehicle_doors ?? undefined,
    co2Emissions: operation.vehicle_co2_emissions ?? undefined,
    vehiclePriceOrigin: operation.vehicle_price_origin ?? undefined,
    isvEstimado: operation.isv_estimado ?? undefined,
    taxaServico: operation.taxa_servico ?? undefined,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function field(key: keyof VehicleSpecInput, numeric = false) {
    return {
      value: (spec[key] as string | number | undefined) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setSpec((prev) => ({ ...prev, [key]: numeric ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value })),
    }
  }

  async function save() {
    setSaving(true)
    setMessage('')
    const res = await updateOperationVehicleSpec(operation.id, spec)
    setSaving(false)
    setMessage(res.error ?? 'Guardado.')
  }

  return (
    <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">ESPECIFICAÇÃO DA VIATURA</h2>
        <p className="text-muted-foreground/60 text-sm">Usada para gerar todos os documentos desta operação</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div><label className={labelClass}>MARCA</label><input type="text" className={fieldClass} {...field('make')} /></div>
        <div><label className={labelClass}>MODELO</label><input type="text" className={fieldClass} {...field('model')} /></div>
        <div><label className={labelClass}>ANO</label><input type="number" className={fieldClass} {...field('year', true)} /></div>
        <div><label className={labelClass}>QUILOMETRAGEM</label><input type="number" className={fieldClass} {...field('km', true)} /></div>
        <div><label className={labelClass}>COR</label><input type="text" className={fieldClass} {...field('colour')} /></div>
        <div><label className={labelClass}>MATRÍCULA</label><input type="text" className={fieldClass} placeholder="AA-00-AA" {...field('plate')} /></div>
        <div><label className={labelClass}>MAT. ESTRANGEIRA</label><input type="text" className={fieldClass} {...field('foreignPlate')} /></div>
        <div><label className={labelClass}>DATA MAT. NACIONAL</label><input type="date" className={fieldClass} {...field('nationalRegistrationDate')} /></div>
        <div><label className={labelClass}>CATEGORIA / TIPO</label><input type="text" className={fieldClass} placeholder="Ligeiro / Passageiros" {...field('categoria')} /></div>
        <div><label className={labelClass}>TARA (KG)</label><input type="number" className={fieldClass} {...field('taraKg', true)} /></div>
        <div><label className={labelClass}>PESO BRUTO (KG)</label><input type="number" className={fieldClass} {...field('pesoBrutoKg', true)} /></div>
        <div><label className={labelClass}>N.º CHASSI (VIN)</label><input type="text" className={fieldClass} {...field('vin')} /></div>
        <div><label className={labelClass}>ORIGEM</label><input type="text" className={fieldClass} placeholder="Alemanha" {...field('countryOrigin')} /></div>
        <div><label className={labelClass}>COMBUSTÍVEL</label><input type="text" className={fieldClass} {...field('fuelType')} /></div>
        <div><label className={labelClass}>POTÊNCIA (CV)</label><input type="number" className={fieldClass} {...field('power', true)} /></div>
        <div><label className={labelClass}>CILINDRADA</label><input type="text" className={fieldClass} placeholder="1995 cm³" {...field('engineSize')} /></div>
        <div><label className={labelClass}>PORTAS</label><input type="number" className={fieldClass} {...field('doors', true)} /></div>
        <div><label className={labelClass}>CO₂ (G/KM)</label><input type="number" className={fieldClass} {...field('co2Emissions', true)} /></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-primary/10 pt-6">
        <div><label className={labelClass}>PREÇO NA ORIGEM (€)</label><input type="number" className={fieldClass} {...field('vehiclePriceOrigin', true)} /></div>
        <div><label className={labelClass}>ISV ESTIMADO (€)</label><input type="number" className={fieldClass} {...field('isvEstimado', true)} /></div>
        <div><label className={labelClass}>TAXA DE SERVIÇO SHARK (€)</label><input type="number" className={fieldClass} {...field('taxaServico', true)} /></div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display text-base rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          GUARDAR ESPECIFICAÇÃO
        </button>
        {message && <p className="font-mono text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
