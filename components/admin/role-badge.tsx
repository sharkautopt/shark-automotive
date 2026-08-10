import type { OperationRole } from '@/lib/types'

const ROLE_STYLES: Record<OperationRole, { bg: string; text: string; label: string }> = {
  comprador: { bg: '#DBEAFE', text: '#1E40AF', label: 'COMPRADOR' },
  encomenda: { bg: '#FEF3C7', text: '#92400E', label: 'ENCOMENDA' },
  parceiro: { bg: '#F3E8FF', text: '#6B21A8', label: 'PARCEIRO' },
}

export function RoleBadge({ role }: { role: OperationRole }) {
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.comprador
  return (
    <span
      className="inline-block font-mono uppercase"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: 0,
        letterSpacing: '0.05em',
      }}
    >
      {style.label}
    </span>
  )
}
