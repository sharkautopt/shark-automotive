'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { guardarTemplateAction } from '@/app/admin/garantias/actions'
import { linesToList } from '@/lib/garantias/format'
import { TEMPLATE_VARIABLES, validateTemplateText } from '@/lib/garantias/template'
import type { ClausulaTemplate, GarantiaTemplate } from '@/lib/garantias/types'

const fieldClass =
  'w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none'
const labelClass = 'block text-muted-foreground/70 text-sm font-mono mb-2'

export function GarantiaTemplateForm({ template }: { template: GarantiaTemplate | null }) {
  const router = useRouter()
  const [nome, setNome] = useState(template?.nome ?? '')
  const [descricao, setDescricao] = useState(template?.descricao ?? '')
  const [prazo, setPrazo] = useState(String(template?.prazo_meses ?? 18))
  const [introducao, setIntroducao] = useState(template?.introducao ?? '')
  const [clausulas, setClausulas] = useState<ClausulaTemplate[]>(template?.clausulas ?? [{ titulo: '', texto: '' }])
  const [componentes, setComponentes] = useState((template?.componentes_cobertos ?? []).join('\n'))
  const [exclusoes, setExclusoes] = useState((template?.exclusoes ?? []).join('\n'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prazoNum = Number(prazo)
  const prazoInvalido = !Number.isInteger(prazoNum) || prazoNum < 18
  const avisos = [
    ...validateTemplateText(introducao).map((e) => `Introdução: ${e}`),
    ...clausulas.flatMap((c, i) => validateTemplateText(c.texto).map((e) => `Cláusula ${i + 1}: ${e}`)),
  ]

  function mover(i: number, d: -1 | 1) {
    setClausulas((cs) => {
      const j = i + d
      if (j < 0 || j >= cs.length) return cs
      const c = [...cs]
      ;[c[i], c[j]] = [c[j], c[i]]
      return c
    })
  }
  const editar = (i: number, k: keyof ClausulaTemplate, v: string) =>
    setClausulas((cs) => cs.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)))

  async function guardar() {
    setBusy(true)
    setError(null)
    const res = await guardarTemplateAction({
      id: template?.id,
      nome,
      descricao,
      prazo_meses: prazoNum,
      introducao,
      clausulas,
      componentes_cobertos: linesToList(componentes),
      exclusoes: linesToList(exclusoes),
    })
    setBusy(false)
    if (!res.ok) return setError(res.error)
    router.push('/admin/garantias/templates')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 rounded-lg px-4 py-3">{error}</p>}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2"><label className={labelClass}>NOME</label><input className={fieldClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Garantia Standard" /></div>
        <div>
          <label className={labelClass}>PRAZO (MESES, MÍN. 18)</label>
          <input className={`${fieldClass} ${prazoInvalido ? 'border-red-400/60' : ''}`} type="number" min={18} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </div>
        <div className="sm:col-span-3"><label className={labelClass}>DESCRIÇÃO (interna)</label><input className={fieldClass} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
      </div>
      <p className="text-muted-foreground/60 text-xs -mt-4">
        O prazo é definido aqui, no template — não se edita garantia a garantia. Para uma garantia alargada cria outro template.
        Alterar um template só afeta garantias emitidas a partir daí; as já emitidas ficam congeladas.
      </p>

      <details className="border border-primary/15 rounded-lg p-4 text-sm">
        <summary className="cursor-pointer text-primary">Variáveis disponíveis ({TEMPLATE_VARIABLES.length})</summary>
        <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1">
          {TEMPLATE_VARIABLES.map((v) => (
            <li key={v.key}><code className="text-primary">{`{{${v.key}}}`}</code> <span className="text-muted-foreground/60">— {v.descricao}</span></li>
          ))}
        </ul>
      </details>

      <div>
        <label className={labelClass}>INTRODUÇÃO (identifica as partes e o veículo)</label>
        <textarea className={fieldClass} rows={6} value={introducao} onChange={(e) => setIntroducao(e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">Cláusulas (numeradas pela ordem)</h3>
          <button type="button" onClick={() => setClausulas((c) => [...c, { titulo: '', texto: '' }])} className="flex items-center gap-1 text-primary text-sm">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        {clausulas.map((c, i) => (
          <div key={i} className="border border-primary/15 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground/60 w-6">{i + 1}.</span>
              <input className={fieldClass} value={c.titulo} onChange={(e) => editar(i, 'titulo', e.target.value)} placeholder="Título" />
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="p-2 text-muted-foreground/60 hover:text-foreground disabled:opacity-30" aria-label="Subir"><ArrowUp className="w-4 h-4" /></button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === clausulas.length - 1} className="p-2 text-muted-foreground/60 hover:text-foreground disabled:opacity-30" aria-label="Descer"><ArrowDown className="w-4 h-4" /></button>
              <button type="button" onClick={() => setClausulas((cs) => cs.filter((_, idx) => idx !== i))} className="p-2 text-red-400/70 hover:text-red-400" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
            </div>
            <textarea className={fieldClass} rows={3} value={c.texto} onChange={(e) => editar(i, 'texto', e.target.value)} placeholder="Texto da cláusula (pode usar variáveis)" />
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelClass}>COMPONENTES COBERTOS POR DEFEITO (um por linha)</label><textarea className={fieldClass} rows={8} value={componentes} onChange={(e) => setComponentes(e.target.value)} /></div>
        <div><label className={labelClass}>EXCLUSÕES POR DEFEITO (uma por linha)</label><textarea className={fieldClass} rows={8} value={exclusoes} onChange={(e) => setExclusoes(e.target.value)} /></div>
      </div>

      {avisos.length > 0 && (
        <ul className="text-amber-300 text-sm border border-amber-500/40 bg-amber-500/10 rounded-lg px-4 py-3 space-y-1">
          {avisos.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      )}

      <button type="button" onClick={guardar} disabled={busy || prazoInvalido || avisos.length > 0} className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Guardar template
      </button>
    </div>
  )
}
