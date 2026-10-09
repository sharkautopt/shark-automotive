import { COMPANY, COMPANY_V2, WARRANTY_PHONE } from '@/lib/pdf/company'
import { addMonthsClamped } from './dates'
import { formatDatePt, formatEuroPt, formatKmPt, joinList } from './format'
import type { GarantiaSnapshot } from './types'

/** Variáveis que os templates podem usar, ex.: {{cliente.nome}}. É a lista oficial (editor + validação). */
export const TEMPLATE_VARIABLES: { key: string; descricao: string }[] = [
  { key: 'cliente.nome', descricao: 'Nome do cliente' },
  { key: 'cliente.nif', descricao: 'NIF do cliente' },
  { key: 'cliente.morada', descricao: 'Morada do cliente' },
  { key: 'cliente.contacto', descricao: 'Contacto do cliente' },
  { key: 'viatura.marca', descricao: 'Marca' },
  { key: 'viatura.modelo', descricao: 'Modelo' },
  { key: 'viatura.matricula', descricao: 'Matrícula' },
  { key: 'viatura.vin', descricao: 'Número de quadro (VIN)' },
  { key: 'viatura.km', descricao: 'Quilómetros na venda' },
  { key: 'venda.data', descricao: 'Data da venda' },
  { key: 'venda.valor', descricao: 'Valor da venda' },
  { key: 'garantia.numero', descricao: 'Número da garantia (GAR/2026/001)' },
  { key: 'garantia.versao', descricao: 'Número da versão' },
  { key: 'garantia.prazo_meses', descricao: 'Prazo em meses (só o número)' },
  { key: 'garantia.prazo_texto', descricao: 'Prazo por extenso: "18 meses por mútuo acordo"' },
  { key: 'garantia.data_inicio', descricao: 'Data de início' },
  { key: 'garantia.data_fim', descricao: 'Data de fim (calculada)' },
  { key: 'garantia.componentes', descricao: 'Lista de componentes cobertos' },
  { key: 'garantia.exclusoes', descricao: 'Lista de exclusões' },
  { key: 'garantia.url_validacao', descricao: 'Endereço da página pública de validação' },
  { key: 'garantia.telefone', descricao: 'Número de assistência da garantia (936 616 026)' },
  { key: 'empresa.nome', descricao: 'Nome legal da empresa' },
  { key: 'empresa.nif', descricao: 'NIPC da empresa' },
  { key: 'empresa.morada', descricao: 'Morada da empresa' },
  { key: 'empresa.email', descricao: 'Email da empresa' },
  { key: 'empresa.telefone', descricao: 'Telefone da empresa' },
]

const ALLOWED = new Set(TEMPLATE_VARIABLES.map((v) => v.key))
const TOKEN_RE = /\{\{([^}]*)\}\}/g

/** Devolve os problemas de um texto de template (variáveis desconhecidas ou mal escritas). */
export function validateTemplateText(text: string): string[] {
  const errors: string[] = []
  for (const match of text.matchAll(TOKEN_RE)) {
    const key = match[1].trim()
    if (!ALLOWED.has(key)) errors.push(`Variável desconhecida: {{${match[1]}}}`)
  }
  const open = (text.match(/\{\{/g) ?? []).length
  const close = (text.match(/\}\}/g) ?? []).length
  if (open !== close) errors.push('Há "{{" ou "}}" sem par.')
  return errors
}

export type TemplateContext = Record<string, string>

/** Substitui {{variavel}}. Falha (em vez de imprimir "—") se faltar um valor: um documento legal não sai incompleto. */
export function renderTemplateText(text: string, ctx: TemplateContext): string {
  return text.replace(TOKEN_RE, (_m, raw: string) => {
    const key = raw.trim()
    if (!ALLOWED.has(key)) throw new Error(`Variável desconhecida no template: {{${key}}}`)
    const value = ctx[key]
    if (value == null || value.trim() === '') throw new Error(`O template usa {{${key}}} mas esse campo está vazio.`)
    return value
  })
}

export function validationUrl(codigo: string): string {
  return `${COMPANY.siteUrl}/garantia/${codigo}`
}

// Identidade v2 (nome sem acento, morada completa): é a que consta da AT e do banco,
// e a mesma que o cabeçalho/rodapé do PDF — o documento não pode ter duas grafias.
export const EMPRESA_SNAPSHOT: GarantiaSnapshot['empresa'] = {
  nome: COMPANY_V2.legalName,
  nif: COMPANY_V2.nif,
  morada: COMPANY_V2.address,
  email: COMPANY.email,
  telefone: COMPANY.phone,
}

/** Dados já resolvidos -> mapa variável/valor. */
export function buildTemplateContext(d: {
  numero: string
  versao: number
  codigo: string
  cliente: GarantiaSnapshot['cliente']
  viatura: GarantiaSnapshot['viatura']
  venda: GarantiaSnapshot['venda']
  garantia: Omit<GarantiaSnapshot['garantia'], 'data_fim'>
  empresa: GarantiaSnapshot['empresa']
}): TemplateContext {
  return {
    'cliente.nome': d.cliente.nome,
    'cliente.nif': d.cliente.nif,
    'cliente.morada': d.cliente.morada,
    'cliente.contacto': d.cliente.contacto,
    'viatura.marca': d.viatura.marca,
    'viatura.modelo': d.viatura.modelo,
    'viatura.matricula': d.viatura.matricula,
    'viatura.vin': d.viatura.vin,
    'viatura.km': formatKmPt(d.viatura.km),
    'venda.data': formatDatePt(d.venda.data),
    'venda.valor': formatEuroPt(d.venda.valor),
    'garantia.numero': d.numero,
    'garantia.versao': String(d.versao),
    'garantia.prazo_meses': String(d.garantia.prazo_meses),
    'garantia.prazo_texto': `${d.garantia.prazo_meses} meses por mútuo acordo`,
    'garantia.data_inicio': formatDatePt(d.garantia.data_inicio),
    'garantia.data_fim': formatDatePt(addMonthsClamped(d.garantia.data_inicio, d.garantia.prazo_meses)),
    'garantia.componentes': joinList(d.garantia.componentes),
    'garantia.exclusoes': joinList(d.garantia.exclusoes),
    'garantia.url_validacao': validationUrl(d.codigo),
    'garantia.telefone': WARRANTY_PHONE,
    'empresa.nome': d.empresa.nome,
    'empresa.nif': d.empresa.nif,
    'empresa.morada': d.empresa.morada,
    'empresa.email': d.empresa.email,
    'empresa.telefone': d.empresa.telefone,
  }
}
