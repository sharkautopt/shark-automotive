import { Check, Circle, Loader2, AlertTriangle } from 'lucide-react'
import type { OperationStepClient } from '@/lib/types'

// SECURITY: this component only ever receives OperationStepClient (internal_note excluded upstream).

function statusVisual(status: string) {
  switch (status) {
    case 'completed':
      return { icon: Check, className: 'text-success border-success', label: 'Concluído' }
    case 'active':
      return { icon: Loader2, className: 'text-primary border-primary', label: 'Em curso' }
    case 'blocked':
      return { icon: AlertTriangle, className: 'text-destructive border-destructive', label: 'Bloqueado' }
    default:
      return { icon: Circle, className: 'text-muted-foreground border-border', label: 'Pendente' }
  }
}

export function StatusTracker({ steps }: { steps: OperationStepClient[] }) {
  const ordered = [...steps].sort((a, b) => a.step_order - b.step_order)
  const completed = ordered.filter((s) => s.step_status === 'completed').length
  const progress = ordered.length ? Math.round((completed / ordered.length) * 100) : 0

  return (
    <section className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono uppercase text-xs tracking-widest text-muted-foreground">
          Estado do Processo
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {completed}/{ordered.length} · {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 mb-8 bg-background">
        <div className="h-1 bg-primary" style={{ width: `${progress}%` }} />
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
                  className={`absolute left-[15px] top-8 bottom-0 w-px ${
                    step.step_status === 'completed' ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center w-8 h-8 shrink-0 border-2 bg-card ${v.className}`}
              >
                <Icon className={`w-4 h-4 ${step.step_status === 'active' ? 'animate-spin' : ''}`} />
              </span>
              <div className="pt-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className={`font-medium ${step.step_status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {step.step_label}
                  </p>
                  <span className={`font-mono uppercase text-[10px] tracking-wider ${v.className.split(' ')[0]}`}>
                    {v.label}
                  </span>
                  {step.completed_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(step.completed_at).toLocaleDateString('pt-PT')}
                    </span>
                  )}
                </div>
                {step.client_note && (
                  <p className="text-sm mt-1 leading-relaxed text-secondary-foreground">
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
