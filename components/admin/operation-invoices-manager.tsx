'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { upsertInvoice, deleteInvoice } from '@/app/admin/operacoes/actions'
import type { Invoice, InvoiceStatus } from '@/lib/types'

const inputClass =
  'w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50'
const labelClass = 'block text-muted-foreground/60 font-mono text-xs uppercase mb-1'

const STATUS_LABEL: Record<InvoiceStatus, { label: string; cls: string }> = {
  paga: { label: 'Paga', cls: 'bg-green-500/15 text-green-400' },
  pendente: { label: 'Pendente', cls: 'bg-amber-500/15 text-amber-400' },
  em_processamento: { label: 'Em processamento', cls: 'bg-blue-500/15 text-blue-400' },
}

export function OperationInvoicesManager({ operationId, invoices }: { operationId: string; invoices: Invoice[] }) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [number, setNumber] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('pendente')

  async function handleSave() {
    setSaving(true)
    await upsertInvoice(operationId, {
      invoiceNumber: number,
      description,
      amount: Number(amount) || 0,
      invoiceDate: date,
      status,
    })
    setSaving(false)
    setShowForm(false)
    setNumber(''); setDescription(''); setAmount(''); setDate(''); setStatus('pendente')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 text-sm">
          <Plus className="w-4 h-4" /> Nova Factura
        </button>
      </div>

      {showForm && (
        <div className="bg-secondary/30 border border-primary/10 rounded-xl p-5 grid md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Nº</label><input className={inputClass} value={number} onChange={(e) => setNumber(e.target.value)} /></div>
          <div><label className={labelClass}>Valor (€)</label><input className={inputClass} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Descrição</label><input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><label className={labelClass}>Data</label><input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <label className={labelClass}>Estado</label>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
              <option value="pendente">Pendente</option>
              <option value="em_processamento">Em processamento</option>
              <option value="paga">Paga</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
            </button>
          </div>
        </div>
      )}

      <div className="bg-secondary/30 border border-primary/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/10 text-muted-foreground/60 font-mono text-xs uppercase">
              <th className="p-4">Nº</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Data</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Estado</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground/50">Sem facturas.</td></tr>
            ) : (
              invoices.map((inv) => {
                const s = STATUS_LABEL[inv.status] ?? STATUS_LABEL.pendente
                return (
                  <tr key={inv.id} className="border-b border-primary/5">
                    <td className="p-4 text-foreground">{inv.invoice_number || '—'}</td>
                    <td className="p-4 text-muted-foreground/80">{inv.description || '—'}</td>
                    <td className="p-4 text-muted-foreground/60">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('pt-PT') : '—'}</td>
                    <td className="p-4 text-foreground">{inv.amount != null ? `${inv.amount.toLocaleString('pt-PT')}€` : '—'}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-mono ${s.cls}`}>{s.label}</span></td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteInvoice(inv.id, operationId)} className="p-2 text-muted-foreground/60 hover:text-red-400" aria-label="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
