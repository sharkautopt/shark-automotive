'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import {
  emitirGarantiaAction,
  guardarRascunhoAction,
  novaVersaoAction,
} from '@/app/admin/garantias/actions'
import { addMonthsClamped } from '@/lib/garantias/dates'
import { formatDatePt, linesToList } from '@/lib/garantias/format'
import type { Garantia, GarantiaInput, GarantiaTemplate } from '@/lib/garantias/types'

const fieldClass =
  'w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none'
const labelClass = 'block text-muted-foreground/70 text-sm font-mono mb-2'

interface Props {
  garantia: Garantia
  templates: GarantiaTemplate[]
  /** rascunho: guarda/emite a v1. nova_versao: garantia já emitida, exige motivo e fica registada. */
  mode: 'rascunho' | 'nova_versao'
  onDone?: () => void
}

export function GarantiaForm({ garantia, templates, mode, onDone }: Props) {
  const router = useRouter()
  const [f, setF] = useState({
    template_id: garantia.template_id ?? templates.find((t) => t.is_default)?.id ?? '',
    cliente_nome: garantia.cliente_nome,
    cliente_nif: garantia.cliente_nif ?? '',
    cliente_morada: garantia.cliente_morada ?? '',
    cliente_contacto: garantia.cliente_contacto ?? '',
    viatura_marca: garantia.viatura_marca ?? '',
    viatura_modelo: garantia.viatura_modelo ?? '',
    viatura_matricula: garantia.viatura_matricula ?? '',
    viatura_vin: garantia.viatura_vin ?? '',
    viatura_km: garantia.viatura_km != null ? String(garantia.viatura_km) : '',
    data_venda: garantia.data_venda ?? '',
    valor_venda: garantia.valor_venda != null ? String(garantia.valor_venda) : '',
    data_inicio: garantia.data_inicio ?? '',
    componentes: garantia.componentes_cobertos.join('\n'),
    exclusoes: garantia.exclusoes.join('\n'),
  })
  const [motivo, setMotivo] = useState('')
  const [busy, setBusy] = useState<null | 'guardar' | 'emitir'>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setSaved(false)
    setF((p) => ({ ...p, [k]: e.target.value }))
  }

  // O prazo nunca se edita: vem do template. Se o template mudou, mostra o do novo; senão o já gravado.
  const tpl = templates.find((t) => t.id === f.template_id)
  const prazo = tpl && tpl.id !== garantia.template_id ? tpl.prazo_meses : garantia.prazo_meses
  const termo = f.data_inicio ? formatDatePt(addMonthsClamped(f.data_inicio, prazo)) : '—'

  function onTemplateChange(id: string) {
    const novo = templates.find((t) => t.id === id)
    setSaved(false)
    setF((p) => ({
      ...p,
      template_id: id,
      componentes: novo ? novo.componentes_cobertos.join('\n') : p.componentes,
      exclusoes: novo ? novo.exclusoes.join('\n') : p.exclusoes,
    }))
  }

  function toInput(): GarantiaInput {
    return {
      template_id: f.template_id || null,
      cliente_nome: f.cliente_nome,
      cliente_nif: f.cliente_nif,
      cliente_morada: f.cliente_morada,
      cliente_contacto: f.cliente_contacto,
      viatura_marca: f.viatura_marca,
      viatura_modelo: f.viatura_modelo,
      viatura_matricula: f.viatura_matricula,
      viatura_vin: f.viatura_vin,
      viatura_km: f.viatura_km === '' ? null : Number(f.viatura_km),
      data_venda: f.data_venda,
      valor_venda: f.valor_venda === '' ? null : Number(f.valor_venda),
      data_inicio: f.data_inicio,
      componentes_cobertos: linesToList(f.componentes),
      exclusoes: linesToList(f.exclusoes),
    }
  }

  async function guardar() {
    setBusy('guardar')
    setError(null)
    const res = await guardarRascunhoAction(garantia.id, toInput())
    setBusy(null)
    if (!res.ok) return setError(res.error)
    setSaved(true)
    router.refresh()
  }

  async function emitir() {
    setError(null)
    if (mode === 'rascunho') {
      if (!window.confirm('Emitir a garantia? Depois de emitida os campos legais ficam bloqueados — qualquer alteração passa a gerar uma nova versão registada.')) return
    } else if (!motivo.trim()) {
      return setError('Indica o motivo da nova versão.')
    }
    setBusy('emitir')
    const res =
      mode === 'rascunho'
        ? await emitirGarantiaAction(garantia.id, toInput())
        : await novaVersaoAction(garantia.id, toInput(), motivo)
    setBusy(null)
    if (!res.ok) return setError(res.error)
    onDone?.()
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 rounded-lg px-4 py-3">{error}</p>}

      <section className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">Template</h3>
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className={labelClass}>TEMPLATE</label>
            <select className={fieldClass} value={f.template_id} onChange={(e) => onTemplateChange(e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                  {t.is_default ? ' (padrão)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground/80 text-sm pb-3">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Prazo: <strong className="text-foreground">{prazo} meses</strong> — definido pelo template, não se edita por caso.
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">Cliente</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>NOME</label><input className={fieldClass} value={f.cliente_nome} onChange={set('cliente_nome')} /></div>
          <div><label className={labelClass}>NIF</label><input className={fieldClass} value={f.cliente_nif} onChange={set('cliente_nif')} inputMode="numeric" /></div>
          <div className="sm:col-span-2"><label className={labelClass}>MORADA</label><input className={fieldClass} value={f.cliente_morada} onChange={set('cliente_morada')} /></div>
          <div><label className={labelClass}>CONTACTO</label><input className={fieldClass} value={f.cliente_contacto} onChange={set('cliente_contacto')} /></div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">Viatura</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={labelClass}>MARCA</label><input className={fieldClass} value={f.viatura_marca} onChange={set('viatura_marca')} /></div>
          <div><label className={labelClass}>MODELO</label><input className={fieldClass} value={f.viatura_modelo} onChange={set('viatura_modelo')} /></div>
          <div><label className={labelClass}>MATRÍCULA</label><input className={fieldClass} value={f.viatura_matricula} onChange={set('viatura_matricula')} /></div>
          <div className="lg:col-span-2"><label className={labelClass}>VIN</label><input className={fieldClass} value={f.viatura_vin} onChange={set('viatura_vin')} /></div>
          <div><label className={labelClass}>KM NA VENDA</label><input className={fieldClass} type="number" min={0} value={f.viatura_km} onChange={set('viatura_km')} /></div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">Venda e vigência</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={labelClass}>DATA DA VENDA</label><input className={fieldClass} type="date" value={f.data_venda} onChange={set('data_venda')} /></div>
          <div><label className={labelClass}>VALOR DA VENDA (€)</label><input className={fieldClass} type="number" min={0} step="0.01" value={f.valor_venda} onChange={set('valor_venda')} /></div>
          <div><label className={labelClass}>INÍCIO DA GARANTIA</label><input className={fieldClass} type="date" value={f.data_inicio} onChange={set('data_inicio')} /></div>
          <div>
            <label className={labelClass}>TERMO (CALCULADO)</label>
            <div className={`${fieldClass} opacity-70`}>{termo}</div>
          </div>
        </div>
        <p className="text-muted-foreground/50 text-xs">
          Por defeito o início é a data da venda; usa a data de entrega se a garantia contar a partir dela.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">Cobertura</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>COMPONENTES COBERTOS (um por linha)</label>
            <textarea className={fieldClass} rows={8} value={f.componentes} onChange={set('componentes')} />
          </div>
          <div>
            <label className={labelClass}>EXCLUSÕES (uma por linha)</label>
            <textarea className={fieldClass} rows={8} value={f.exclusoes} onChange={set('exclusoes')} />
          </div>
        </div>
      </section>

      {mode === 'nova_versao' && (
        <section className="space-y-2">
          <label className={labelClass}>MOTIVO DA NOVA VERSÃO (obrigatório, fica no histórico)</label>
          <textarea className={fieldClass} rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: NIF do cliente corrigido" />
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {mode === 'rascunho' && (
          <button
            type="button"
            onClick={guardar}
            disabled={busy !== null}
            className="flex items-center gap-2 border border-primary/30 text-foreground px-5 py-3 rounded-lg hover:bg-secondary/50 disabled:opacity-50"
          >
            {busy === 'guardar' && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar rascunho
          </button>
        )}
        <button
          type="button"
          onClick={emitir}
          disabled={busy !== null}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {busy === 'emitir' && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'rascunho' ? 'Emitir garantia' : 'Emitir nova versão'}
        </button>
        {saved && <span className="text-green-400 text-sm">Rascunho guardado.</span>}
      </div>
    </div>
  )
}
