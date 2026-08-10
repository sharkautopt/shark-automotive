'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { updateStep } from '@/app/admin/operacoes/actions'
import type { OperationStep, StepStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: StepStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'active', label: 'Em curso' },
  { value: 'completed', label: 'Concluído' },
  { value: 'blocked', label: 'Bloqueado' },
]

const inputClass =
  'w-full bg-shark-navy border border-shark-gold/20 rounded-lg px-3 py-2 text-shark-silver text-sm placeholder:text-shark-silver/30 focus:outline-none focus:border-shark-gold/50'

function StepRow({ step, operationId }: { step: OperationStep; operationId: string }) {
  const [status, setStatus] = useState<StepStatus>(step.step_status)
  const [clientNote, setClientNote] = useState(step.client_note ?? '')
  const [internalNote, setInternalNote] = useState(step.internal_note ?? '')
  const [notify, setNotify] = useState(step.notify_client ?? false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await updateStep(step.id, operationId, {
      status,
      clientNote,
      internalNote,
      notifyClient: notify,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-shark-gold/10 text-shark-gold flex items-center justify-center font-mono text-xs">
            {step.step_order}
          </span>
          <span className="text-shark-silver font-medium">{step.step_label}</span>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as StepStatus)} className="bg-shark-navy border border-shark-gold/20 rounded-lg px-3 py-2 text-shark-silver text-sm">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-shark-silver/60 font-mono text-xs uppercase mb-1">Nota para o cliente</label>
          <textarea className={inputClass} rows={2} value={clientNote} onChange={(e) => setClientNote(e.target.value)} placeholder="Visível ao cliente" />
        </div>
        <div>
          <label className="block text-shark-silver/60 font-mono text-xs uppercase mb-1">Nota interna (privada)</label>
          <textarea className={inputClass} rows={2} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Nunca mostrada ao cliente" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-shark-silver/70 text-sm cursor-pointer">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-shark-gold" />
          Notificar cliente por email ao guardar
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-shark-gold text-shark-navy font-medium px-4 py-2 rounded-lg hover:bg-shark-gold-light transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

export function OperationStepsEditor({ operationId, steps }: { operationId: string; steps: OperationStep[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <StepRow key={step.id} step={step} operationId={operationId} />
      ))}
    </div>
  )
}
