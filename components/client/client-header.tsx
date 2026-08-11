import { RoleBadge } from '@/components/admin/role-badge'
import type { OperationRole } from '@/lib/types'

export function ClientHeader({ name, role, title }: { name: string; role: OperationRole; title: string }) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono uppercase text-xs tracking-widest" style={{ color: '#6B7280' }}>
          {title}
        </span>
        <RoleBadge role={role} />
      </div>
      <h1 className="text-3xl font-semibold text-balance" style={{ color: '#0E1B2F' }}>
        Olá, {name}
      </h1>
    </header>
  )
}
