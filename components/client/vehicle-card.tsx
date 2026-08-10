'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Operation } from '@/lib/types'
import { getDossierUrl } from '@/app/area-cliente/actions'

export function VehicleCard({ operation }: { operation: Operation }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function openDossier() {
    setLoading(true)
    setError('')
    const res = await getDossierUrl(operation.id)
    setLoading(false)
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    } else {
      setError(res.error || 'Dossier ainda não disponível.')
    }
  }

  const hasPhoto = Boolean(operation.vehicle_photo_url)

  return (
    <div className="border border-[#C8C4BC] bg-white">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[220px] bg-[#0D1B2A]">
          {hasPhoto ? (
            <Image
              src={operation.vehicle_photo_url as string}
              alt={`${operation.vehicle_make ?? ''} ${operation.vehicle_model ?? ''}`.trim() || 'Viatura'}
              fill
              className="object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#E8E4DC]/60">
                Sem fotografia
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-bebas text-2xl tracking-wide text-[#0D1B2A]">
              {[operation.vehicle_make, operation.vehicle_model].filter(Boolean).join(' ') || 'Viatura'}
            </h3>
            {operation.protocolo_score != null && (
              <span className="shrink-0 border border-[#0D1B2A] bg-[#0D1B2A] px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-[#E8E4DC]">
                {operation.protocolo_score}/150
              </span>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Ano" value={operation.vehicle_year?.toString()} />
            <Field
              label="Quilómetros"
              value={operation.vehicle_km != null ? `${operation.vehicle_km.toLocaleString('pt-PT')} km` : undefined}
            />
            <Field label="Cor" value={operation.vehicle_colour} />
            <Field label="Matrícula" value={operation.vehicle_plate || 'Aguarda matrícula'} />
          </dl>

          <button
            onClick={openDossier}
            disabled={loading}
            className="mt-6 w-full bg-[#0D1B2A] px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#E8E4DC] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'A gerar link...' : 'Ver Dossier Técnico'}
          </button>
          {error && <p className="mt-2 font-mono text-[11px] text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-[#0D1B2A]/50">{label}</dt>
      <dd className="mt-1 text-sm text-[#0D1B2A]">{value || '—'}</dd>
    </div>
  )
}
