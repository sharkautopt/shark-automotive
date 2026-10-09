/** YYYY-MM-DD -> dd/mm/aaaa */
export function formatDatePt(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

/** 6890.5 -> "6 890,50 €" (sempre com cêntimos e sem espaços especiais, que a fonte do PDF não tem). */
export function formatEuroPt(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    useGrouping: 'always',
  })
    .format(value)
    .replace(/[  ]/g, ' ')
}

export function formatKmPt(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-PT', { useGrouping: 'always' }).format(value).replace(/[  ]/g, ' ')
}

/** ["motor","caixa","direção"] -> "motor, caixa e direção" */
export function joinList(items: string[]): string {
  const list = items.map((s) => s.trim()).filter(Boolean)
  if (list.length <= 1) return list.join('')
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`
}

/** Texto de várias linhas -> lista limpa (uma entrada por linha). */
export function linesToList(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}
