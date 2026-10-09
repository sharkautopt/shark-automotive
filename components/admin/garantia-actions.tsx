'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, FileText, Loader2, Mail, PenLine, Upload } from 'lucide-react'
import { anularGarantiaAction } from '@/app/admin/garantias/actions'
import { GarantiaForm } from './garantia-form'
import type { Garantia, GarantiaTemplate } from '@/lib/garantias/types'

const fieldClass =
  'w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none'
const btn =
  'flex items-center gap-2 border border-primary/30 text-foreground px-4 py-2.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50 text-sm'

type Painel = null | 'email' | 'assinada' | 'versao' | 'anular'

export function GarantiaAcoes({
  garantia,
  templates,
  emailSugerido,
}: {
  garantia: Garantia
  templates: GarantiaTemplate[]
  emailSugerido: string
}) {
  const router = useRouter()
  const [painel, setPainel] = useState<Painel>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [email, setEmail] = useState(emailSugerido)
  const [ficheiro, setFicheiro] = useState<File | null>(null)
  const [motivoAnular, setMotivoAnular] = useState('')

  const emitida = garantia.estado === 'emitida' || garantia.estado === 'assinada'
  if (garantia.estado === 'anulada') return null

  function toggle(p: Exclude<Painel, null>) {
    setMsg(null)
    setPainel((cur) => (cur === p ? null : p))
  }

  async function enviar() {
    setBusy(true)
    setMsg(null)
    const res = await fetch(`/api/admin/garantias/${garantia.id}/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ para: email }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? 'Falha ao enviar.' })
    setMsg({ ok: true, text: `Enviada para ${email}.` })
    router.refresh()
  }

  async function carregarAssinada() {
    if (!ficheiro) return setMsg({ ok: false, text: 'Escolhe o ficheiro da via assinada.' })
    setBusy(true)
    setMsg(null)
    const body = new FormData()
    body.append('ficheiro', ficheiro)
    const res = await fetch(`/api/admin/garantias/${garantia.id}/assinada`, { method: 'POST', body })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? 'Falha ao carregar.' })
    setPainel(null)
    setFicheiro(null)
    router.refresh()
  }

  async function anular() {
    if (!window.confirm('Anular esta garantia? É definitivo e fica registado no histórico.')) return
    setBusy(true)
    setMsg(null)
    const res = await anularGarantiaAction(garantia.id, motivoAnular)
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: res.error })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {emitida && (
          <>
            <a href={`/api/admin/garantias/${garantia.id}/pdf`} target="_blank" rel="noopener noreferrer" className={btn}>
              <FileText className="w-4 h-4" /> Abrir PDF (v{garantia.versao_atual})
            </a>
            <button type="button" className={btn} onClick={() => toggle('email')}>
              <Mail className="w-4 h-4" /> Enviar por email
            </button>
            <button type="button" className={btn} onClick={() => toggle('assinada')}>
              <Upload className="w-4 h-4" /> {garantia.estado === 'assinada' ? 'Substituir via assinada' : 'Carregar via assinada'}
            </button>
            {garantia.assinada_ficheiro && (
              <a href={`/api/admin/garantias/${garantia.id}/assinada`} target="_blank" rel="noopener noreferrer" className={btn}>
                <PenLine className="w-4 h-4" /> Ver via assinada
              </a>
            )}
            <button type="button" className={btn} onClick={() => toggle('versao')}>
              <PenLine className="w-4 h-4" /> Criar nova versão
            </button>
          </>
        )}
        <button type="button" className={`${btn} text-red-400 border-red-400/30`} onClick={() => toggle('anular')}>
          <Ban className="w-4 h-4" /> Anular
        </button>
      </div>

      {msg && (
        <p className={`text-sm rounded-lg px-4 py-3 border ${msg.ok ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
          {msg.text}
        </p>
      )}

      {painel === 'email' && (
        <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-background/40">
          <p className="text-muted-foreground/70 text-sm">Envia a versão {garantia.versao_atual} com o PDF (duas vias) em anexo. Só fica registada como enviada se o envio tiver sucesso.</p>
          <input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email do cliente" />
          <button type="button" onClick={enviar} disabled={busy} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg disabled:opacity-50 text-sm">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enviar
          </button>
        </div>
      )}

      {painel === 'assinada' && (
        <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-background/40">
          <p className="text-muted-foreground/70 text-sm">Carrega o scan ou foto da via assinada (PDF, JPG ou PNG, até 4 MB). A garantia passa a &quot;assinada&quot;.</p>
          <input className={fieldClass} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={carregarAssinada} disabled={busy} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg disabled:opacity-50 text-sm">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Guardar e marcar como assinada
          </button>
        </div>
      )}

      {painel === 'anular' && (
        <div className="border border-red-400/30 rounded-lg p-4 space-y-3 bg-red-400/5">
          <p className="text-muted-foreground/70 text-sm">A anulação é definitiva. O número fica contabilizado e a garantia deixa de ser válida na página pública.</p>
          <textarea className={fieldClass} rows={2} value={motivoAnular} onChange={(e) => setMotivoAnular(e.target.value)} placeholder="Motivo da anulação (obrigatório)" />
          <button type="button" onClick={anular} disabled={busy || !motivoAnular.trim()} className="flex items-center gap-2 bg-red-500/80 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 text-sm">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Anular garantia
          </button>
        </div>
      )}

      {painel === 'versao' && emitida && (
        <div className="border border-primary/20 rounded-lg p-6 bg-background/40">
          <p className="text-muted-foreground/70 text-sm mb-6">
            Uma garantia emitida não se edita: isto cria a versão {garantia.versao_atual + 1}, guarda a anterior intacta e regista o motivo.
            {garantia.estado === 'assinada' && ' Como o conteúdo muda, a via assinada deixa de valer e terá de ser assinada de novo.'}
          </p>
          <GarantiaForm garantia={garantia} templates={templates} mode="nova_versao" onDone={() => setPainel(null)} />
        </div>
      )}
    </div>
  )
}
