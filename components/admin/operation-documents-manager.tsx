'use client'

import { useState } from 'react'
import { Loader2, Upload, Trash2, Download, FileText } from 'lucide-react'
import { uploadOperationDocument, deleteDocument, getAdminSignedUrl } from '@/app/admin/operacoes/actions'
import { DOCUMENT_SLOTS } from '@/lib/step-templates'
import type { OperationDocument } from '@/lib/types'

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  disponivel: { label: 'Disponível', cls: 'bg-green-500/15 text-green-400' },
  pendente: { label: 'Pendente', cls: 'bg-amber-500/15 text-amber-400' },
  nao_aplicavel: { label: 'N/A', cls: 'bg-muted-foreground/10 text-muted-foreground/50' },
}

export function OperationDocumentsManager({ operationId, documents }: { operationId: string; documents: OperationDocument[] }) {
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)

  async function handleUpload(docType: string, docLabel: string, file: File) {
    setUploadingSlot(docType)
    const b64 = await fileToBase64(file)
    await uploadOperationDocument(operationId, docType, docLabel, file.name, b64)
    setUploadingSlot(null)
  }

  async function handleDownload(path: string) {
    const { url } = await getAdminSignedUrl(path)
    if (url) window.open(url, '_blank')
  }

  // documents already uploaded, grouped by doc_type
  const byType = new Map<string, OperationDocument[]>()
  for (const d of documents) {
    const key = d.doc_type ?? 'outro'
    if (!byType.has(key)) byType.set(key, [])
    byType.get(key)!.push(d)
  }

  // Client-uploaded docs that aren't in the standard slots
  const clientExtras = documents.filter((d) => d.uploaded_by === 'client' && !DOCUMENT_SLOTS.some((s) => s.doc_type === d.doc_type))

  return (
    <div className="space-y-3">
      {DOCUMENT_SLOTS.map((slot) => {
        const existing = byType.get(slot.doc_type) ?? []
        const latest = existing[0]
        const status = latest?.status ?? 'pendente'
        const s = STATUS_LABEL[status] ?? STATUS_LABEL.pendente
        return (
          <div key={slot.doc_type} className="bg-secondary/30 border border-primary/10 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-foreground truncate">{slot.doc_label}</p>
                {latest?.uploaded_by === 'client' && (
                  <span className="text-xs text-blue-400">Submetido pelo cliente</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`px-2 py-1 rounded text-xs font-mono ${s.cls}`}>{s.label}</span>
              {latest?.storage_path && (
                <>
                  <button onClick={() => handleDownload(latest.storage_path!)} className="p-2 text-muted-foreground/70 hover:text-primary" aria-label="Descarregar">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteDocument(latest.id, operationId)} className="p-2 text-muted-foreground/70 hover:text-red-400" aria-label="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <label className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg cursor-pointer hover:bg-primary/20 text-sm">
                {uploadingSlot === slot.doc_type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Carregar
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(slot.doc_type, slot.doc_label, f)
                  }}
                />
              </label>
            </div>
          </div>
        )
      })}

      {clientExtras.length > 0 && (
        <div className="pt-4">
          <p className="text-muted-foreground/60 font-mono text-xs uppercase mb-2">Outros documentos do cliente</p>
          {clientExtras.map((d) => (
            <div key={d.id} className="bg-secondary/30 border border-primary/10 rounded-xl p-4 flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-foreground truncate">{d.doc_label || d.doc_type}</p>
                <span className="text-xs text-blue-400">Submetido pelo cliente</span>
              </div>
              {d.storage_path && (
                <button onClick={() => handleDownload(d.storage_path!)} className="p-2 text-muted-foreground/70 hover:text-primary" aria-label="Descarregar">
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
