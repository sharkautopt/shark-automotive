'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Invoice } from '@/lib/types'
import { getDocumentUrl } from '@/app/area-cliente/actions'

const STATUS: Record<string, { label: string; className: string }> = {
  paga: { label: 'Paga', className: 'bg-[#DCFCE7] text-[#166534]' },
  pendente: { label: 'Pendente', className: 'bg-[#FEF3C7] text-[#92400E]' },
  em_processamento: { label: 'Em Processamento', className: 'bg-[#DBEAFE] text-[#1E40AF]' },
}

function euro(n: number | null): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n)
}

export function InvoicesSection({
  operationId,
  invoices,
}: {
  operationId: string
  invoices: Invoice[]
}) {
  const [busyId, setBusyId] = useState<string | null>(null)

  async function download(inv: Invoice) {
    if (!inv.storage_path) return
    setBusyId(inv.id)
    const res = await getDocumentUrl(operationId, inv.storage_path)
    setBusyId(null)
    if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="border border-[#9FADBB] bg-white">
      <header className="border-b border-[#9FADBB] px-6 py-4">
        <h2 className="font-bebas text-xl tracking-wide text-[#0E1B2F]">Facturas</h2>
      </header>

      {invoices.length === 0 ? (
        <p className="px-6 py-8 text-sm text-[#0E1B2F]/70">Sem facturas disponíveis.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-[#9FADBB] font-mono text-[10px] uppercase tracking-widest text-[#0E1B2F]/50">
                <th className="px-6 py-3 font-normal">Nº</th>
                <th className="px-6 py-3 font-normal">Descrição</th>
                <th className="px-6 py-3 font-normal">Data</th>
                <th className="px-6 py-3 font-normal">Valor</th>
                <th className="px-6 py-3 font-normal">Estado</th>
                <th className="px-6 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#9FADBB]">
              {invoices.map((inv) => {
                const status = STATUS[inv.status] ?? STATUS.pendente
                return (
                  <tr key={inv.id} className="text-sm text-[#0E1B2F]">
                    <td className="px-6 py-4 font-mono text-xs">{inv.invoice_number || '—'}</td>
                    <td className="px-6 py-4">{inv.description || '—'}</td>
                    <td className="px-6 py-4">
                      {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('pt-PT') : '—'}
                    </td>
                    <td className="px-6 py-4">{euro(inv.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.storage_path && (
                        <button
                          onClick={() => download(inv)}
                          disabled={busyId === inv.id}
                          className="flex items-center gap-1 border border-[#0E1B2F] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#0E1B2F] hover:bg-[#0E1B2F] hover:text-[#E8E4DC] disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {busyId === inv.id ? '...' : 'Download'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
