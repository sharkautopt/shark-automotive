'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ativarTemplateAction, duplicarTemplateAction, tornarTemplatePadraoAction } from '@/app/admin/garantias/actions'
import type { GarantiaTemplate } from '@/lib/garantias/types'

export function GarantiaTemplateActions({ template }: { template: GarantiaTemplate }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true)
    setError(null)
    const res = await fn()
    setBusy(false)
    if (!res.ok) return setError(res.error ?? 'Erro')
    router.refresh()
  }
  const cls = 'text-primary text-sm hover:underline disabled:opacity-50'

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
      <button className={cls} disabled={busy} onClick={() => run(() => duplicarTemplateAction(template.id))}>Duplicar</button>
      {!template.is_default && template.ativo && (
        <button className={cls} disabled={busy} onClick={() => run(() => tornarTemplatePadraoAction(template.id))}>Tornar padrão</button>
      )}
      {!template.is_default && (
        <button className={cls} disabled={busy} onClick={() => run(() => ativarTemplateAction(template.id, !template.ativo))}>
          {template.ativo ? 'Desativar' : 'Ativar'}
        </button>
      )}
      {error && <span className="basis-full text-right text-red-400 text-xs">{error}</span>}
    </div>
  )
}
