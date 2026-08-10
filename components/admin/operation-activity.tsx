import type { ActivityLogEntry } from '@/lib/types'

export function OperationActivity({ activity }: { activity: ActivityLogEntry[] }) {
  if (activity.length === 0) {
    return <p className="text-shark-silver/50 py-8 text-center">Sem actividade registada.</p>
  }
  return (
    <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl divide-y divide-shark-gold/5">
      {activity.map((a) => (
        <div key={a.id} className="p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-shark-silver">{a.action}</p>
            {a.detail && <p className="text-shark-silver/50 text-sm">{a.detail}</p>}
            <p className="text-shark-silver/40 text-xs mt-1 font-mono">{a.performed_by}</p>
          </div>
          <span className="text-shark-silver/40 text-xs shrink-0">{new Date(a.performed_at).toLocaleString('pt-PT')}</span>
        </div>
      ))}
    </div>
  )
}
