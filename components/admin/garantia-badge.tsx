import type { GarantiaEstadoEfetivo } from '@/lib/garantias/types'

const STYLES: Record<GarantiaEstadoEfetivo, { label: string; cls: string }> = {
  rascunho: { label: 'Rascunho', cls: 'bg-secondary/60 text-muted-foreground' },
  emitida: { label: 'Emitida', cls: 'bg-primary/20 text-primary' },
  assinada: { label: 'Assinada', cls: 'bg-green-500/20 text-green-400' },
  anulada: { label: 'Anulada', cls: 'bg-red-500/20 text-red-400' },
  expirada: { label: 'Expirada', cls: 'bg-amber-500/20 text-amber-400' },
}

export function GarantiaBadge({ estado }: { estado: GarantiaEstadoEfetivo }) {
  const { label, cls } = STYLES[estado]
  return <span className={`inline-block rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${cls}`}>{label}</span>
}
