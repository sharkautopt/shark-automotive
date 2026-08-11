import { Check, Circle, Loader2, AlertTriangle } from 'lucide-react'
import type { OperationStepClient } from '@/lib/types'

// SECURITY: this component only ever receives OperationStepClient (internal_note excluded upstream).

const NAVY = '#0E1B2F'
const BORDER = '#9FADBB'
const MUTED = '#6B7280'
const GREEN = '#15803D'
const AMBER = '#B45309'

function statusVisual(status: string) {
  switch (status) {
    case 'completed':
      return { icon: Check, color: GREEN, ring: GREEN, label: 'Concluído' }
    case 'active':
      return { icon: Loader2, color: NAVY, ring: NAVY, label: 'Em curso' }
    case 'blocked':
      return { icon: AlertTriangle, color: AMBER, ring: AMBER, label: 'Bloqueado' }
    default:
      return { icon: Circle, color: MUTED, ring: BORDER, label: 'Pendente' }
  }
}

export function StatusTracker({ steps }: { steps: OperationStepClient[] }) {
  const ordered = [...steps].sort((a, b) => a.step_order - b.step_order)
  const activeIndex = ordered.findIndex((s) => s.step_status === 'active')
  const completed = ordered.filter((s) => s.step_status === 'completed').length
  const progress = ordered.length ? Math.round((completed / ordered.length) * 100) : 0

  return (
    <section style={{ backgroundColor: '#ffffff', border: `1px solid ${BORDER}` }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono uppercase text-xs tracking-widest" style={{ color: MUTED }}>
          Estado do Processo
        </h2>
        <span className="font-mono text-xs" style={{ color: MUTED }}>
          {completed}/{ordered.length} · {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 mb-8" style={{ backgroundColor: '#EEF2F6' }}>
        <div className="h-1" style={{ width: `${progress}%`, backgroundColor: NAVY }} />
      </div>

      {/* Vertical timeline */}
      <ol className="relative">
        {ordered.map((step, i) => {
          const v = statusVisual(step.step_status)
          const Icon = v.icon
          const isLast = i === ordered.length - 1
          return (
            <li key={step.id} className="relative flex gap-4 pb-6">
              {!isLast && (
                <span
                  className="absolute left-[15px] top-8 bottom-0 w-px"
                  style={{ backgroundColor: step.step_status === 'completed' ? GREEN : BORDER }}
                />
              )}
              <span
                className="relative z-10 flex items-center justify-center w-8 h-8 shrink-0"
                style={{ border: `2px solid ${v.ring}`, color: v.color, backgroundColor: '#ffffff' }}
              >
                <Icon className={`w-4 h-4 ${step.step_status === 'active' ? 'animate-spin' : ''}`} />
              </span>
              <div className="pt-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-medium" style={{ color: step.step_status === 'pending' ? MUTED : NAVY }}>
                    {step.step_label}
                  </p>
                  <span className="font-mono uppercase text-[10px] tracking-wider" style={{ color: v.color }}>
                    {v.label}
                  </span>
                  {step.completed_at && (
                    <span className="text-xs" style={{ color: MUTED }}>
                      {new Date(step.completed_at).toLocaleDateString('pt-PT')}
                    </span>
                  )}
                </div>
                {step.client_note && (
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#374151' }}>
                    {step.client_note}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
