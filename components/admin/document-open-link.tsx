'use client'

import { useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { getAdminSignedUrl } from '@/app/admin/operacoes/actions'

interface DocumentOpenLinkProps {
  publicUrl: string | null
  storagePath: string | null
}

/** Client-side action cell: signs storage_path on demand, falling back to public_url for older rows. */
export function DocumentOpenLink({ publicUrl, storagePath }: DocumentOpenLinkProps) {
  const [loading, setLoading] = useState(false)

  if (!publicUrl && !storagePath) {
    return <span className="text-muted-foreground/30">—</span>
  }

  const open = async () => {
    setLoading(true)
    let url = publicUrl
    if (storagePath) {
      const { url: signed } = await getAdminSignedUrl(storagePath, 'documents')
      if (signed) url = signed
    }
    setLoading(false)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className="inline-flex items-center gap-1 text-primary hover:text-primary disabled:opacity-50"
    >
      PDF {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
    </button>
  )
}
