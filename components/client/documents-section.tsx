'use client'

import { useState } from 'react'
import { FileText, Download, Upload } from 'lucide-react'
import type { OperationDocument } from '@/lib/types'
import { getDocumentUrl, uploadClientDocument } from '@/app/area-cliente/actions'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  disponivel: { label: 'Disponível', className: 'bg-[#DCFCE7] text-[#166534]' },
  pendente: { label: 'Pendente', className: 'bg-[#FEF3C7] text-[#92400E]' },
  nao_aplicavel: { label: 'N/A', className: 'bg-[#F3F4F6] text-[#6B7280]' },
}

export function DocumentsSection({
  operationId,
  documents,
}: {
  operationId: string
  documents: OperationDocument[]
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function download(doc: OperationDocument) {
    if (!doc.storage_path) return
    setBusyId(doc.id)
    const res = await getDocumentUrl(operationId, doc.storage_path)
    setBusyId(null)
    if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
    else setError(res.error || 'Não foi possível gerar o link.')
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('operationId', operationId)
    const res = await uploadClientDocument(fd)
    setUploading(false)
    e.target.value = ''
    if (res.error) setError(res.error)
  }

  return (
    <section className="border border-[#C8C4BC] bg-white">
      <header className="flex items-center justify-between border-b border-[#C8C4BC] px-6 py-4">
        <h2 className="font-bebas text-xl tracking-wide text-[#0D1B2A]">Documentos</h2>
        <label className="flex cursor-pointer items-center gap-2 bg-[#0D1B2A] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#E8E4DC] hover:opacity-90">
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'A carregar...' : 'Submeter'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </header>

      {error && <p className="px-6 pt-4 font-mono text-[11px] text-red-600">{error}</p>}

      {documents.length === 0 ? (
        <p className="px-6 py-8 text-sm leading-relaxed text-[#0D1B2A]/70">
          Nenhum documento disponível ainda. A equipa Shark irá carregar os documentos à medida que o
          processo avança.
        </p>
      ) : (
        <ul className="divide-y divide-[#C8C4BC]">
          {documents.map((doc) => {
            const status = STATUS_LABELS[doc.status] ?? STATUS_LABELS.pendente
            return (
              <li key={doc.id} className="flex items-center gap-4 px-6 py-4">
                <FileText className="h-5 w-5 shrink-0 text-[#0D1B2A]/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#0D1B2A]">{doc.doc_label || doc.doc_type || 'Documento'}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#0D1B2A]/50">
                    {doc.uploaded_by === 'client' ? 'Submetido pelo cliente · ' : ''}
                    {new Date(doc.uploaded_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${status.className}`}>
                  {status.label}
                </span>
                {doc.storage_path && (
                  <button
                    onClick={() => download(doc)}
                    disabled={busyId === doc.id}
                    className="flex items-center gap-1 border border-[#0D1B2A] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-[#E8E4DC] disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {busyId === doc.id ? '...' : 'Download'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
