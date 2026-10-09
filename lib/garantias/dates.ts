import type { Garantia, GarantiaEstadoEfetivo } from './types'

/** Garantias que terminam dentro deste nº de dias ganham alerta visual. */
export const ALERTA_DIAS = 30

/** Hoje em Lisboa, como YYYY-MM-DD (evita deslocações de fuso horário). */
export function hojeLisboa(now: Date = new Date()): string {
  return now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' })
}

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return { y, m, d }
}

function diasNoMes(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate() // m: 1-12
}

/**
 * Soma meses a uma data ISO (YYYY-MM-DD) como o Postgres e o art. 279.º do
 * Código Civil: cai no dia correspondente do mês final, ou no último dia do
 * mês se esse dia não existir (31/08 + 18 meses = 29/02). A base de dados
 * recalcula sempre o valor final — esta função serve para mostrar e para
 * renderizar o texto; os testes garantem que as duas coincidem.
 */
export function addMonthsClamped(iso: string, months: number): string {
  const { y, m, d } = parseIso(iso)
  const total = m - 1 + months
  const ny = y + Math.floor(total / 12)
  const nm = (total % 12) + 1
  const nd = Math.min(d, diasNoMes(ny, nm))
  return `${ny}-${String(nm).padStart(2, '0')}-${String(nd).padStart(2, '0')}`
}

/** Dias inteiros desde hoje até à data de fim (negativo se já passou). */
export function diasAte(isoFim: string, hoje: string = hojeLisboa()): number {
  const a = parseIso(hoje)
  const b = parseIso(isoFim)
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000)
}

/** Estado "real": emitida/assinada passam a expirada no dia a seguir ao fim. */
export function estadoEfetivo(
  g: Pick<Garantia, 'estado' | 'data_fim'>,
  hoje: string = hojeLisboa(),
): GarantiaEstadoEfetivo {
  if ((g.estado === 'emitida' || g.estado === 'assinada') && g.data_fim && diasAte(g.data_fim, hoje) < 0) {
    return 'expirada'
  }
  return g.estado
}

/** Emitida/assinada que termina nos próximos ALERTA_DIAS dias (inclusive o próprio dia). */
export function aExpirar(
  g: Pick<Garantia, 'estado' | 'data_fim'>,
  hoje: string = hojeLisboa(),
): boolean {
  if (!(g.estado === 'emitida' || g.estado === 'assinada') || !g.data_fim) return false
  const d = diasAte(g.data_fim, hoje)
  return d >= 0 && d <= ALERTA_DIAS
}
