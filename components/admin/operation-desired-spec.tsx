'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { Operation } from '@/lib/types'
import { updateOperationDesiredSpec, type DesiredSpecInput } from '@/app/admin/operacoes/actions'
import { ORIGEM_OPTIONS, SEGMENTO_OPTIONS } from './vehicle-identification-fields'

const fieldClass =
  'w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none'
const labelClass = 'block text-muted-foreground/70 text-sm font-mono mb-2'

// "What the client is asking for" — used by Proposta de Importação. Kept
// separate from OperationVehicleSpec ("what was actually found"), since a
// Proposta is generated before any specific car has been sourced.
export function OperationDesiredSpec({ operation }: { operation: Operation }) {
  const [spec, setSpec] = useState<DesiredSpecInput>({
    make: operation.desired_make ?? '',
    model: operation.desired_model ?? '',
    segmento: operation.desired_segmento ?? '',
    origem: operation.desired_origem ?? '',
    yearMin: operation.desired_year_min ?? undefined,
    kmMax: operation.desired_km_max ?? undefined,
    fuelType: operation.desired_fuel_type ?? '',
    transmission: operation.desired_transmission ?? '',
    equipmentNotes: operation.desired_equipment_notes ?? '',
    budgetMax: operation.budget_max ?? undefined,
    sinalAdjudicacao: operation.sinal_adjudicacao ?? undefined,
    prazoEntregaEstimado: operation.prazo_entrega_estimado ?? '',
    propostaValidadeDias: operation.proposta_validade_dias ?? 15,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function field(key: keyof DesiredSpecInput, numeric = false) {
    return {
      value: (spec[key] as string | number | undefined) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setSpec((prev) => ({ ...prev, [key]: numeric ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value })),
    }
  }

  async function save() {
    setSaving(true)
    setMessage('')
    const res = await updateOperationDesiredSpec(operation.id, spec)
    setSaving(false)
    setMessage(res.error ?? 'Guardado.')
  }

  return (
    <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">VIATURA PRETENDIDA E CONDIÇÕES</h2>
        <p className="text-muted-foreground/60 text-sm">Usado pela Proposta de Importação</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div><label className={labelClass}>MARCA</label><input type="text" className={fieldClass} {...field('make')} /></div>
        <div><label className={labelClass}>MODELO</label><input type="text" className={fieldClass} {...field('model')} /></div>
        <div>
          <label className={labelClass}>SEGMENTO</label>
          <select className={fieldClass} {...field('segmento')}>
            <option value="">Selecionar</option>
            {SEGMENTO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>ORIGEM</label>
          <select className={fieldClass} {...field('origem')}>
            <option value="">Selecionar</option>
            {ORIGEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div><label className={labelClass}>ANO MÍNIMO</label><input type="number" className={fieldClass} {...field('yearMin', true)} /></div>
        <div><label className={labelClass}>QUILOMETRAGEM MÁXIMA</label><input type="number" className={fieldClass} {...field('kmMax', true)} /></div>
        <div><label className={labelClass}>COMBUSTÍVEL</label><input type="text" className={fieldClass} {...field('fuelType')} /></div>
        <div><label className={labelClass}>CAIXA</label><input type="text" className={fieldClass} {...field('transmission')} /></div>
      </div>

      <div>
        <label className={labelClass}>EQUIPAMENTO EXIGIDO E EXCLUSÕES</label>
        <textarea rows={2} className={`${fieldClass} resize-none`} {...field('equipmentNotes')} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-primary/10 pt-6">
        <div><label className={labelClass}>ORÇAMENTO MÁXIMO (€)</label><input type="number" className={fieldClass} {...field('budgetMax', true)} /></div>
        <div><label className={labelClass}>SINAL À ADJUDICAÇÃO (€)</label><input type="number" className={fieldClass} {...field('sinalAdjudicacao', true)} /></div>
        <div><label className={labelClass}>PRAZO ESTIMADO DE ENTREGA</label><input type="text" placeholder="30 a 45 dias úteis" className={fieldClass} {...field('prazoEntregaEstimado')} /></div>
        <div><label className={labelClass}>VALIDADE DA PROPOSTA (DIAS)</label><input type="number" className={fieldClass} {...field('propostaValidadeDias', true)} /></div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display text-base rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          GUARDAR
        </button>
        {message && <p className="font-mono text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
