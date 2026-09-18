'use client'

import { useState } from 'react'
import { FileText, Download, CheckCircle2, Loader2 } from 'lucide-react'
import type { GeneratedDocument } from '@/lib/types'
import { getGeneratedDocumentUrl, acceptGeneratedDocument } from '@/app/area-cliente/actions'

const DOC_LABELS: Record<string, string> = {
  proposta_importacao: 'Proposta de Importação',
  orcamento_importacao: 'Orçamento de Importação',
  contrato_compra_venda: 'Contrato de Compra e Venda',
  declaracao_entrega: 'Declaração de Entrega',
  procuracao: 'Procuração',
  declaracao_circulacao: 'Declaração de Circulação',
}

// Admin-generated legal documents (Contrato, Procuração, Declarações,
// Proposta/Orçamento de Importação) tied to this operation — distinct from
// DocumentsSection, which is client-attachment uploads (a different table).
export function GeneratedDocumentsSection({ operationId, documents }: { operationId: string; documents: GeneratedDocument[] }) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function open(doc: GeneratedDocument) {
    setBusyId(doc.id)
    setError(null)
    const res = await getGeneratedDocumentUrl(operationId, doc.id)
    setBusyId(null)
    if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
    else setError(res.error || 'Não foi possível gerar o link.')
  }

  async function accept(doc: GeneratedDocument) {
    setBusyId(doc.id)
    setError(null)
    const res = await acceptGeneratedDocument(operationId, doc.id)
    setBusyId(null)
    if (res.error) setError(res.error)
  }

  if (documents.length === 0) return null

  return (
    <section className="border border-border bg-card mb-6">
      <header className="border-b border-border px-6 py-4">
        <h2 className="font-display text-xl tracking-wide text-foreground">Documentos</h2>
      </header>

      {error && <p className="px-6 pt-4 font-mono text-[11px] text-destructive">{error}</p>}

      <ul className="divide-y divide-border">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-4 px-6 py-4">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{DOC_LABELS[doc.doc_type] || doc.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {doc.document_number ? `${doc.document_number} · ` : ''}
                {new Date(doc.created_at).toLocaleDateString('pt-PT')}
              </p>
            </div>

            {doc.doc_type === 'orcamento_importacao' && (
              doc.accepted_at ? (
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aceite
                </span>
              ) : (
                <button
                  onClick={() => accept(doc)}
                  disabled={busyId === doc.id}
                  className="flex items-center gap-1 border border-primary px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                >
                  {busyId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Aceitar
                </button>
              )
            )}

            <button
              onClick={() => open(doc)}
              disabled={busyId === doc.id}
              className="flex items-center gap-1 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Abrir
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
