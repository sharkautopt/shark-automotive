'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { updateResults } from '@/app/admin/operacoes/actions'
import type { Operation } from '@/lib/types'

const inputClass =
  'w-full bg-shark-navy border border-shark-gold/20 rounded-lg px-3 py-2 text-shark-silver text-sm placeholder:text-shark-silver/30 focus:outline-none focus:border-shark-gold/50'
const labelClass = 'block text-shark-silver/60 font-mono text-xs uppercase mb-1'

export function OperationResults({ operation }: { operation: Operation }) {
  const [amount, setAmount] = useState(operation.result_amount?.toString() ?? '')
  const [date, setDate] = useState(operation.result_date ?? '')
  const [notes, setNotes] = useState(operation.result_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await updateResults(operation.id, {
      resultAmount: amount ? Number(amount) : null,
      resultDate: date || null,
      resultNotes: notes,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6 max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Valor investido</label>
          <p className="text-shark-silver py-2">{operation.investment_amount != null ? `${operation.investment_amount.toLocaleString('pt-PT')}€` : '—'}</p>
        </div>
        <div>
          <label className={labelClass}>Data de entrada</label>
          <p className="text-shark-silver py-2">{operation.investment_date ? new Date(operation.investment_date).toLocaleDateString('pt-PT') : '—'}</p>
        </div>
      </div>
      <div>
        <label className={labelClass}>Resultado apurado (€)</label>
        <input className={inputClass} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Data de liquidação</label>
        <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Observações</label>
        <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-shark-gold text-shark-navy font-medium px-4 py-2 rounded-lg hover:bg-shark-gold-light transition-colors disabled:opacity-50 text-sm">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? 'Guardado' : 'Guardar Resultados'}
      </button>
    </div>
  )
}
