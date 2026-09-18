'use client'

import { useState } from 'react'
import { FileText, Loader2, Download } from 'lucide-react'
import type { Operation } from '@/lib/types'

interface DocDef {
  key: string
  label: string
  endpoint: string
  /** Only shown for operations with this role, or any role if omitted. */
  role?: Operation['role']
  /** Extra fixed fields merged into the POST body — e.g. { mode: "proposta" }. */
  extraBody?: Record<string, string>
}

// Extended stage by stage as each document type is built (Contrato,
// Procuração, Declaração de Entrega, Proposta/Orçamento de Importação).
// Deliberately named "Documentos Gerados" and kept as its own section,
// distinct from the upload-manager slots below it (one of which is
// confusingly also named "Contrato" — that's a client-attachment slot,
// this is Shark's own generated legal document).
const DOCS: DocDef[] = [
  { key: 'proposta_importacao', label: 'Proposta de Importação', endpoint: '/api/admin/documents/importacao', role: 'encomenda', extraBody: { mode: 'proposta' } },
  { key: 'orcamento_importacao', label: 'Orçamento de Importação', endpoint: '/api/admin/documents/importacao', role: 'encomenda', extraBody: { mode: 'orcamento' } },
  { key: 'declaracao_circulacao', label: 'Declaração de Circulação', endpoint: '/api/admin/documents/declaracao-circulacao' },
]

export function OperationDocumentGenerator({ operation }: { operation: Operation }) {
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})

  const visibleDocs = DOCS.filter((d) => !d.role || d.role === operation.role)

  async function generate(doc: DocDef) {
    setBusyKey(doc.key)
    setError(null)
    try {
      const res = await fetch(doc.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId: operation.id, ...doc.extraBody }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao gerar o documento.')
        return
      }
      setResults((prev) => ({ ...prev, [doc.key]: data.signedUrl }))
      if (data.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Não foi possível gerar o documento.')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6 mb-6">
      <h2 className="font-display text-2xl text-foreground mb-1">DOCUMENTOS GERADOS</h2>
      <p className="text-muted-foreground/60 text-sm mb-6">
        Gerados a partir da especificação da viatura preenchida na aba &quot;Viatura&quot;.
      </p>

      {error && (
        <p className="mb-4 text-red-400 text-sm border border-red-400/30 bg-red-400/10 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {visibleDocs.map((doc) => (
          <div key={doc.key} className="flex items-center justify-between gap-3 border border-primary/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">{doc.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {results[doc.key] && (
                <a
                  href={results[doc.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-primary hover:text-primary/80"
                  aria-label="Abrir PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => generate(doc)}
                disabled={busyKey === doc.key}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {busyKey === doc.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {busyKey === doc.key ? 'A gerar...' : 'Gerar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
