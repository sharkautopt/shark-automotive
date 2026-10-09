import type { GarantiaInput } from './types'

/** Campos obrigatórios para emitir (um documento legal não sai com buracos). Rascunhos podem estar incompletos. */
export function validarParaEmissao(g: GarantiaInput & { prazo_meses: number }): string[] {
  const faltam: string[] = []
  const vazio = (s: string | null | undefined) => !s || !s.trim()

  if (vazio(g.cliente_nome)) faltam.push('Nome do cliente')
  if (vazio(g.cliente_nif)) faltam.push('NIF do cliente')
  else if (!/^\d{9}$/.test(g.cliente_nif.replace(/\s/g, ''))) faltam.push('NIF do cliente (deve ter 9 dígitos)')
  if (vazio(g.cliente_morada)) faltam.push('Morada do cliente')
  if (vazio(g.viatura_marca)) faltam.push('Marca')
  if (vazio(g.viatura_modelo)) faltam.push('Modelo')
  if (vazio(g.viatura_matricula)) faltam.push('Matrícula')
  if (vazio(g.viatura_vin)) faltam.push('VIN')
  if (g.viatura_km == null || g.viatura_km < 0) faltam.push('Quilómetros na venda')
  if (vazio(g.data_venda)) faltam.push('Data da venda')
  if (g.valor_venda == null || g.valor_venda <= 0) faltam.push('Valor da venda')
  if (vazio(g.data_inicio)) faltam.push('Data de início da garantia')
  if (g.componentes_cobertos.length === 0) faltam.push('Pelo menos um componente coberto')
  if (g.prazo_meses < 18) faltam.push('Prazo (mínimo 18 meses — vem do template)')
  return faltam
}
