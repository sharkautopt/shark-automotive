import type { ActivityLogEntry } from '@/lib/types'

export function OperationActivity({ activity }: { activity: ActivityLogEntry[] }) {
  if (activity.length === 0) {
    return <p className="text-muted-foreground/50 py-8 text-center">Sem actividade registada.</p>
  }
  return (
    <div className="bg-secondary/30 border border-primary/10 rounded-xl divide-y divide-primary/5">
      {activity.map((a) => (
        <div key={a.id} className="p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-foreground">{a.action}</p>
            {a.detail && <p className="text-muted-foreground/50 text-sm">{a.detail}</p>}
            <p className="text-muted-foreground/40 text-xs mt-1 font-mono">{a.performed_by}</p>
          </div>
          <span className="text-muted-foreground/40 text-xs shrink-0">{new Date(a.performed_at).toLocaleString('pt-PT')}</span>
        </div>
      ))}
    </div>
  )
}
