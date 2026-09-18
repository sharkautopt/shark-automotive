'use client'

import { useState } from 'react'
import { FileText, Loader2, Download, ChevronDown, AlertTriangle } from 'lucide-react'
import type { Operation, Profile } from '@/lib/types'

interface DocDef {
  key: string
  label: string
  endpoint: string
  /** Only shown for operations with this role, or any role if omitted. */
  role?: Operation['role']
  /** Extra fixed fields merged into the POST body — e.g. { mode: "proposta" }. */
  extraBody?: Record<string, string>
  /** True for docs that need a small form filled in before generating (facts
   * about a specific event, not persistent data — e.g. delivery details). */
  needsEntregaForm?: boolean
  /** True for docs where a wrong field is a real legal problem — shows the
   * mandante's data for explicit admin review before generating. */
  needsIdReview?: boolean
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
  { key: 'contrato_compra_venda', label: 'Contrato de Compra e Venda', endpoint: '/api/admin/documents/contrato' },
  { key: 'declaracao_entrega', label: 'Declaração de Entrega', endpoint: '/api/admin/documents/declaracao-entrega', needsEntregaForm: true },
  { key: 'procuracao', label: 'Procuração', endpoint: '/api/admin/documents/procuracao', needsIdReview: true },
  { key: 'declaracao_circulacao', label: 'Declaração de Circulação', endpoint: '/api/admin/documents/declaracao-circulacao' },
]

interface EntregaForm {
  quilometragem: string
  local: string
  chavesEntregues: string
  nivelCombustivel: string
  observacoes: string
}

const ENTREGA_DEFAULTS: EntregaForm = { quilometragem: '', local: 'Lisboa', chavesEntregues: '2', nivelCombustivel: '', observacoes: '' }

export function OperationDocumentGenerator({ operation, profile }: { operation: Operation; profile: Profile }) {
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [entregaForm, setEntregaForm] = useState<EntregaForm>(ENTREGA_DEFAULTS)

  const visibleDocs = DOCS.filter((d) => !d.role || d.role === operation.role)

  async function generate(doc: DocDef, extra?: EntregaForm | { confirmed: boolean }) {
    setBusyKey(doc.key)
    setError(null)
    try {
      const res = await fetch(doc.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId: operation.id, ...doc.extraBody, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao gerar o documento.')
        return
      }
      setResults((prev) => ({ ...prev, [doc.key]: data.signedUrl }))
      setExpandedKey(null)
      if (data.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Não foi possível gerar o documento.')
    } finally {
      setBusyKey(null)
    }
  }

  function handleGenerateClick(doc: DocDef) {
    if (doc.needsEntregaForm || doc.needsIdReview) {
      setExpandedKey((prev) => (prev === doc.key ? null : doc.key))
      return
    }
    generate(doc)
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
          <div key={doc.key} className={(doc.needsEntregaForm || doc.needsIdReview) && expandedKey === doc.key ? 'sm:col-span-2' : ''}>
            <div className="flex items-center justify-between gap-3 border border-primary/20 rounded-lg px-4 py-3">
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
                  onClick={() => handleGenerateClick(doc)}
                  disabled={busyKey === doc.key}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {busyKey === doc.key && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {(doc.needsEntregaForm || doc.needsIdReview) && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedKey === doc.key ? 'rotate-180' : ''}`} />}
                  {busyKey === doc.key ? 'A gerar...' : 'Gerar'}
                </button>
              </div>
            </div>

            {doc.needsEntregaForm && expandedKey === doc.key && (
              <div className="mt-2 border border-primary/20 rounded-lg p-4 space-y-3 bg-background/40">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text" placeholder="Quilometragem à entrega"
                    value={entregaForm.quilometragem}
                    onChange={(e) => setEntregaForm((p) => ({ ...p, quilometragem: e.target.value }))}
                    className="px-3 py-2 bg-background border border-primary/20 rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Local da entrega"
                    value={entregaForm.local}
                    onChange={(e) => setEntregaForm((p) => ({ ...p, local: e.target.value }))}
                    className="px-3 py-2 bg-background border border-primary/20 rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Chaves entregues"
                    value={entregaForm.chavesEntregues}
                    onChange={(e) => setEntregaForm((p) => ({ ...p, chavesEntregues: e.target.value }))}
                    className="px-3 py-2 bg-background border border-primary/20 rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Nível de combustível"
                    value={entregaForm.nivelCombustivel}
                    onChange={(e) => setEntregaForm((p) => ({ ...p, nivelCombustivel: e.target.value }))}
                    className="px-3 py-2 bg-background border border-primary/20 rounded-lg text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Observações ao estado do veículo (opcional)"
                  value={entregaForm.observacoes}
                  onChange={(e) => setEntregaForm((p) => ({ ...p, observacoes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-foreground text-sm focus:border-primary focus:outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => generate(doc, entregaForm)}
                  disabled={busyKey === doc.key}
                  className="px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  Confirmar e Gerar
                </button>
              </div>
            )}

            {doc.needsIdReview && expandedKey === doc.key && (
              <div className="mt-2 border border-amber-500/30 rounded-lg p-4 space-y-3 bg-amber-500/5">
                <div className="flex items-start gap-2 text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Confirme os dados de identificação do mandante antes de gerar. Um NIF ou número de documento errado numa procuração é um problema real.</p>
                </div>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div><dt className="text-muted-foreground/60 text-xs font-mono uppercase">Nome</dt><dd className="text-foreground">{profile.full_name || '— em falta —'}</dd></div>
                  <div><dt className="text-muted-foreground/60 text-xs font-mono uppercase">NIF</dt><dd className="text-foreground">{profile.nif || '— em falta —'}</dd></div>
                  <div><dt className="text-muted-foreground/60 text-xs font-mono uppercase">Documento de identificação</dt><dd className="text-foreground">{profile.id_document_number || '— em falta —'}</dd></div>
                  <div><dt className="text-muted-foreground/60 text-xs font-mono uppercase">Validade do documento</dt><dd className="text-foreground">{profile.id_document_validity || '— em falta —'}</dd></div>
                  <div><dt className="text-muted-foreground/60 text-xs font-mono uppercase">Data de nascimento</dt><dd className="text-foreground">{profile.birth_date || '— em falta —'}</dd></div>
                  <div><dt className="text-muted-foreground/60 text-xs font-mono uppercase">Morada</dt><dd className="text-foreground">{profile.morada || '— em falta —'}</dd></div>
                </dl>
                <p className="text-muted-foreground/60 text-xs">
                  Dados em falta? O cliente pode preenchê-los em Definições no portal, ou pode editá-los directamente na base de dados.
                </p>
                <button
                  type="button"
                  onClick={() => generate(doc, { confirmed: true })}
                  disabled={busyKey === doc.key}
                  className="px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  Confirmo os dados — Gerar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
