'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Loader2, Download, AlertCircle, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GeneratedDoc {
  id: string
  title: string
  public_url: string | null
  storage_path?: string | null
  created_at: string
  generated_by: string | null
}

interface VehicleDocumentsProps {
  vehicleId: string
}

export function VehicleDocuments({ vehicleId }: VehicleDocumentsProps) {
  const [docs, setDocs] = useState<GeneratedDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDocs = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('generated_documents')
      .select('id, title, public_url, storage_path, created_at, generated_by')
      .eq('vehicle_id', vehicleId)
      .eq('doc_type', 'window_sticker')
      .order('created_at', { ascending: false })

    if (!error && data) setDocs(data)
    setLoading(false)
  }, [vehicleId])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  const openDocument = async (doc: GeneratedDoc) => {
    setError(null)
    if (!doc.public_url) {
      setError('Este documento não tem um URL de download válido.')
      return
    }
    const opened = window.open(doc.public_url, '_blank', 'noopener,noreferrer')
    if (!opened) setError('O navegador bloqueou a abertura. Permita pop-ups para descarregar o documento.')
  }

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/documents/window-sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao gerar o documento.')
        return
      }
      // Open the freshly generated PDF and refresh the list.
      if (data.publicUrl) window.open(data.publicUrl, '_blank')
      await loadDocs()
    } catch {
      setError('Não foi possível gerar o documento.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-foreground">DOCUMENTOS</h2>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display text-base rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {generating ? 'A GERAR...' : 'GERAR WINDOW STICKER'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground/50 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          A carregar documentos...
        </div>
      ) : docs.length === 0 ? (
        <p className="text-muted-foreground/50 text-sm font-mono py-4">
          Ainda não foram gerados documentos para este veículo.
        </p>
      ) : (
        <div className="divide-y divide-primary/10">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-sm">{doc.title}</p>
                  <p className="text-muted-foreground/40 text-xs font-mono">
                    {new Date(doc.created_at).toLocaleString('pt-PT')}
                    {doc.generated_by ? ` · ${doc.generated_by}` : ''}
                  </p>
                </div>
              </div>
              {(doc.public_url || doc.storage_path) && (
                <button
                  type="button"
                  onClick={() => openDocument(doc)}
                  aria-label={`Descarregar ${doc.title}`}
                  className="flex items-center gap-1.5 text-primary text-sm hover:text-primary transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
