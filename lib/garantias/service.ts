// SERVER ONLY — usa o service role. Toda a lógica de estado das garantias passa por aqui.
import { randomInt } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { loadOperationDocData } from '@/lib/pdf/operation-doc-helpers'
import { addMonthsClamped, estadoEfetivo, hojeLisboa } from './dates'
import { EMPRESA_SNAPSHOT, buildTemplateContext, renderTemplateText, validateTemplateText } from './template'
import { validarParaEmissao } from './validate'
import type {
  AdminUser,
  ClausulaTemplate,
  Garantia,
  GarantiaEstadoEfetivo,
  GarantiaEvento,
  GarantiaEventoTipo,
  GarantiaInput,
  GarantiaSnapshot,
  GarantiaTemplate,
  GarantiaVersao,
} from './types'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem 0/O/1/I
const CODE_LENGTH = 10

export function gerarCodigoVerificacao(): string {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return out
}

export const PRAZO_MINIMO_MESES = 18

// ------------------------------------------------------------------ eventos
export async function registarEvento(
  garantiaId: string,
  tipo: GarantiaEventoTipo,
  user: AdminUser,
  opts: { versao?: number | null; detalhes?: Record<string, unknown> } = {},
) {
  const { error } = await supabaseAdmin.from('garantia_eventos').insert({
    garantia_id: garantiaId,
    versao: opts.versao ?? null,
    tipo,
    user_id: user.id,
    user_email: user.email,
    detalhes: opts.detalhes ?? {},
  })
  if (error) console.error('[garantias] falha a registar evento', tipo, error.message)
}

// ---------------------------------------------------------------- templates
function mapTemplate(row: Record<string, unknown>): GarantiaTemplate {
  return row as unknown as GarantiaTemplate
}

export async function listTemplates(): Promise<GarantiaTemplate[]> {
  const { data, error } = await supabaseAdmin
    .from('garantia_templates')
    .select('*')
    .order('is_default', { ascending: false })
    .order('nome')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapTemplate)
}

export async function getTemplate(id: string): Promise<GarantiaTemplate | null> {
  const { data, error } = await supabaseAdmin.from('garantia_templates').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapTemplate(data) : null
}

export async function getDefaultTemplate(): Promise<GarantiaTemplate | null> {
  const { data, error } = await supabaseAdmin
    .from('garantia_templates')
    .select('*')
    .eq('is_default', true)
    .eq('ativo', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapTemplate(data) : null
}

export interface TemplateInput {
  id?: string
  nome: string
  descricao: string
  prazo_meses: number
  introducao: string
  clausulas: ClausulaTemplate[]
  componentes_cobertos: string[]
  exclusoes: string[]
}

/** Erros de validação de um template (lista vazia = válido). */
export function validarTemplate(t: TemplateInput): string[] {
  const erros: string[] = []
  if (!t.nome.trim()) erros.push('O template precisa de um nome.')
  if (!Number.isInteger(t.prazo_meses) || t.prazo_meses < PRAZO_MINIMO_MESES) {
    erros.push(`O prazo tem de ser um número inteiro de meses, no mínimo ${PRAZO_MINIMO_MESES}.`)
  }
  if (!t.introducao.trim()) erros.push('A introdução não pode estar vazia.')
  erros.push(...validateTemplateText(t.introducao).map((e) => `Introdução: ${e}`))
  t.clausulas.forEach((c, i) => {
    if (!c.titulo.trim() || !c.texto.trim()) erros.push(`Cláusula ${i + 1}: título e texto são obrigatórios.`)
    erros.push(...validateTemplateText(c.texto).map((e) => `Cláusula ${i + 1}: ${e}`))
  })
  if (t.clausulas.length === 0) erros.push('Adiciona pelo menos uma cláusula.')
  if (t.componentes_cobertos.length === 0) erros.push('Indica pelo menos um componente coberto.')
  return erros
}

export async function saveTemplate(t: TemplateInput, user: AdminUser): Promise<GarantiaTemplate> {
  const erros = validarTemplate(t)
  if (erros.length) throw new Error(erros.join(' '))

  const row = {
    nome: t.nome.trim(),
    descricao: t.descricao.trim() || null,
    prazo_meses: t.prazo_meses,
    introducao: t.introducao.trim(),
    clausulas: t.clausulas.map((c) => ({ titulo: c.titulo.trim(), texto: c.texto.trim() })),
    componentes_cobertos: t.componentes_cobertos,
    exclusoes: t.exclusoes,
    updated_at: new Date().toISOString(),
    updated_by: user.email,
  }
  const query = t.id
    ? supabaseAdmin.from('garantia_templates').update(row).eq('id', t.id)
    : supabaseAdmin.from('garantia_templates').insert(row)
  const { data, error } = await query.select('*').single()
  if (error || !data) throw new Error(error?.message ?? 'Falha ao guardar o template.')
  return mapTemplate(data)
}

export async function setTemplateDefault(id: string, user: AdminUser) {
  const t = await getTemplate(id)
  if (!t) throw new Error('Template não encontrado.')
  if (!t.ativo) throw new Error('Ativa o template antes de o tornares o padrão.')
  const off = await supabaseAdmin.from('garantia_templates').update({ is_default: false }).eq('is_default', true)
  if (off.error) throw new Error(off.error.message)
  const on = await supabaseAdmin
    .from('garantia_templates')
    .update({ is_default: true, updated_at: new Date().toISOString(), updated_by: user.email })
    .eq('id', id)
  if (on.error) throw new Error(on.error.message)
}

export async function setTemplateAtivo(id: string, ativo: boolean, user: AdminUser) {
  const t = await getTemplate(id)
  if (!t) throw new Error('Template não encontrado.')
  if (!ativo && t.is_default) throw new Error('Não podes desativar o template padrão. Escolhe outro padrão primeiro.')
  const { error } = await supabaseAdmin
    .from('garantia_templates')
    .update({ ativo, updated_at: new Date().toISOString(), updated_by: user.email })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function duplicateTemplate(id: string, user: AdminUser): Promise<GarantiaTemplate> {
  const t = await getTemplate(id)
  if (!t) throw new Error('Template não encontrado.')
  return saveTemplate(
    {
      nome: `${t.nome} (cópia)`,
      descricao: t.descricao ?? '',
      prazo_meses: t.prazo_meses,
      introducao: t.introducao,
      clausulas: t.clausulas,
      componentes_cobertos: t.componentes_cobertos,
      exclusoes: t.exclusoes,
    },
    user,
  )
}

// ----------------------------------------------------------------- garantias
function mapGarantia(row: Record<string, unknown>): Garantia {
  return row as unknown as Garantia
}

export async function getGarantia(id: string): Promise<Garantia | null> {
  const { data, error } = await supabaseAdmin.from('garantias').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapGarantia(data) : null
}

export async function listarGarantias(): Promise<Garantia[]> {
  const { data, error } = await supabaseAdmin.from('garantias').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapGarantia)
}

/** Garantia ativa (não anulada) da operação, se existir. */
export async function getGarantiaAtivaDaOperacao(operationId: string): Promise<Garantia | null> {
  const { data, error } = await supabaseAdmin
    .from('garantias')
    .select('*')
    .eq('operation_id', operationId)
    .neq('estado', 'anulada')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapGarantia(data) : null
}

export async function getVersoes(garantiaId: string): Promise<GarantiaVersao[]> {
  const { data, error } = await supabaseAdmin
    .from('garantia_versoes')
    .select('*')
    .eq('garantia_id', garantiaId)
    .order('versao', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as GarantiaVersao[]
}

export async function getEventos(garantiaId: string): Promise<GarantiaEvento[]> {
  const { data, error } = await supabaseAdmin
    .from('garantia_eventos')
    .select('*')
    .eq('garantia_id', garantiaId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as GarantiaEvento[]
}

export async function getVersao(garantiaId: string, versao: number): Promise<GarantiaVersao | null> {
  const { data, error } = await supabaseAdmin
    .from('garantia_versoes')
    .select('*')
    .eq('garantia_id', garantiaId)
    .eq('versao', versao)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as unknown as GarantiaVersao) ?? null
}

/** Cria o rascunho pré-preenchido com os dados da operação (cliente, viatura, preço do stock). */
export async function criarRascunhoDaOperacao(operationId: string, user: AdminUser): Promise<Garantia> {
  const { operation, profile } = await loadOperationDocData(operationId)

  // Regra do cliente: a garantia aplica-se a viaturas em stock, nunca ao fluxo de encomenda.
  if (operation.role !== 'comprador') {
    throw new Error('As garantias só se aplicam a viaturas em stock (operações de comprador).')
  }
  const existente = await getGarantiaAtivaDaOperacao(operationId)
  if (existente) throw new Error('Esta operação já tem uma garantia ativa.')

  const tpl = await getDefaultTemplate()
  if (!tpl) throw new Error('Não há nenhum template de garantia ativo definido como padrão.')

  // Preço de venda: o da viatura de stock de onde veio a operação (por ligação, ou pelo VIN).
  let valor: number | null = null
  if (operation.vehicle_id) {
    const { data } = await supabaseAdmin.from('vehicles').select('price').eq('id', operation.vehicle_id).maybeSingle()
    valor = (data?.price as number | null | undefined) ?? null
  } else if (operation.vehicle_vin) {
    const { data } = await supabaseAdmin.from('vehicles').select('price').eq('vin', operation.vehicle_vin).maybeSingle()
    valor = (data?.price as number | null | undefined) ?? null
  }

  const hoje = hojeLisboa()
  const { data, error } = await supabaseAdmin
    .from('garantias')
    .insert({
      operation_id: operationId,
      template_id: tpl.id,
      cliente_nome: profile.full_name ?? '',
      cliente_nif: profile.nif,
      cliente_morada: profile.morada,
      cliente_contacto: profile.phone ?? profile.email,
      viatura_marca: operation.vehicle_make,
      viatura_modelo: operation.vehicle_model,
      viatura_matricula: operation.vehicle_plate,
      viatura_vin: operation.vehicle_vin,
      viatura_km: operation.vehicle_km,
      data_venda: hoje,
      valor_venda: valor,
      prazo_meses: tpl.prazo_meses,
      data_inicio: hoje,
      componentes_cobertos: tpl.componentes_cobertos,
      exclusoes: tpl.exclusoes,
      criado_por: user.id,
      criado_por_email: user.email,
    })
    .select('*')
    .single()

  if (error || !data) {
    if (error?.code === '23505') throw new Error('Esta operação já tem uma garantia ativa.')
    throw new Error(error?.message ?? 'Falha ao criar a garantia.')
  }
  await registarEvento(data.id, 'criada', user, { detalhes: { operation_id: operationId, template: tpl.nome } })
  return mapGarantia(data)
}

const CAMPOS_EDITAVEIS: (keyof GarantiaInput)[] = [
  'cliente_nome', 'cliente_nif', 'cliente_morada', 'cliente_contacto',
  'viatura_marca', 'viatura_modelo', 'viatura_matricula', 'viatura_vin', 'viatura_km',
  'data_venda', 'valor_venda', 'data_inicio', 'componentes_cobertos', 'exclusoes',
]

function limparInput(i: GarantiaInput): GarantiaInput {
  const t = (s: string) => s.trim()
  return {
    ...i,
    cliente_nome: t(i.cliente_nome),
    cliente_nif: t(i.cliente_nif),
    cliente_morada: t(i.cliente_morada),
    cliente_contacto: t(i.cliente_contacto),
    viatura_marca: t(i.viatura_marca),
    viatura_modelo: t(i.viatura_modelo),
    viatura_matricula: t(i.viatura_matricula).toUpperCase(),
    viatura_vin: t(i.viatura_vin).toUpperCase(),
    componentes_cobertos: i.componentes_cobertos.map(t).filter(Boolean),
    exclusoes: i.exclusoes.map(t).filter(Boolean),
  }
}

/** Grava um rascunho. O prazo nunca vem do formulário: ao mudar de template copia-se o do novo template. */
export async function guardarRascunho(id: string, input: GarantiaInput, user: AdminUser): Promise<Garantia> {
  const g = await getGarantia(id)
  if (!g) throw new Error('Garantia não encontrada.')
  if (g.estado !== 'rascunho') {
    throw new Error('Só os rascunhos se editam. Numa garantia emitida cria uma nova versão.')
  }
  const dados = limparInput(input)
  const patch: Record<string, unknown> = {}
  for (const k of CAMPOS_EDITAVEIS) {
    patch[k] = typeof dados[k] === 'string' && dados[k] === '' ? null : dados[k]
  }
  patch.cliente_nome = dados.cliente_nome

  if (dados.template_id && dados.template_id !== g.template_id) {
    const tpl = await getTemplate(dados.template_id)
    if (!tpl || !tpl.ativo) throw new Error('Template inválido ou desativado.')
    patch.template_id = tpl.id
    patch.prazo_meses = tpl.prazo_meses
    patch.componentes_cobertos = tpl.componentes_cobertos
    patch.exclusoes = tpl.exclusoes
  }

  const alterados: Record<string, { de: unknown; para: unknown }> = {}
  for (const [k, v] of Object.entries(patch)) {
    const antes = (g as unknown as Record<string, unknown>)[k]
    if (JSON.stringify(antes ?? null) !== JSON.stringify(v ?? null)) alterados[k] = { de: antes ?? null, para: v ?? null }
  }
  if (Object.keys(alterados).length === 0) return g

  const { data, error } = await supabaseAdmin
    .from('garantias')
    .update(patch)
    .eq('id', id)
    .eq('estado', 'rascunho')
    .select('*')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Falha ao guardar o rascunho.')
  await registarEvento(id, 'editada', user, { detalhes: { alterados } })
  return mapGarantia(data)
}

/** Constrói o snapshot (conteúdo já com as variáveis resolvidas). Falha se faltar algum valor. */
export function construirSnapshot(
  dados: GarantiaInput & { prazo_meses: number },
  tpl: GarantiaTemplate,
  numero: string,
  versao: number,
  codigo: string,
): GarantiaSnapshot {
  const base = {
    cliente: {
      nome: dados.cliente_nome,
      nif: dados.cliente_nif,
      morada: dados.cliente_morada,
      contacto: dados.cliente_contacto,
    },
    viatura: {
      marca: dados.viatura_marca,
      modelo: dados.viatura_modelo,
      matricula: dados.viatura_matricula,
      vin: dados.viatura_vin,
      km: dados.viatura_km as number,
    },
    venda: { data: dados.data_venda, valor: dados.valor_venda as number },
    garantia: {
      prazo_meses: dados.prazo_meses,
      data_inicio: dados.data_inicio,
      componentes: dados.componentes_cobertos,
      exclusoes: dados.exclusoes,
    },
    empresa: EMPRESA_SNAPSHOT,
  }
  const ctx = buildTemplateContext({ numero, versao, codigo, ...base })
  return {
    numero,
    versao,
    codigo_verificacao: codigo,
    emitida_em: '', // a base de dados carimba a hora ao gravar a versão
    ...base,
    garantia: { ...base.garantia, data_fim: addMonthsClamped(dados.data_inicio, dados.prazo_meses) },
    template: { id: tpl.id, nome: tpl.nome },
    conteudo: {
      introducao: renderTemplateText(tpl.introducao, ctx),
      clausulas: tpl.clausulas.map((c) => ({ titulo: c.titulo, texto: renderTemplateText(c.texto, ctx) })),
    },
  }
}

function paraInput(g: Garantia): GarantiaInput & { prazo_meses: number } {
  return {
    template_id: g.template_id,
    cliente_nome: g.cliente_nome,
    cliente_nif: g.cliente_nif ?? '',
    cliente_morada: g.cliente_morada ?? '',
    cliente_contacto: g.cliente_contacto ?? '',
    viatura_marca: g.viatura_marca ?? '',
    viatura_modelo: g.viatura_modelo ?? '',
    viatura_matricula: g.viatura_matricula ?? '',
    viatura_vin: g.viatura_vin ?? '',
    viatura_km: g.viatura_km,
    data_venda: g.data_venda ?? '',
    valor_venda: g.valor_venda,
    data_inicio: g.data_inicio ?? '',
    componentes_cobertos: g.componentes_cobertos,
    exclusoes: g.exclusoes,
    prazo_meses: g.prazo_meses,
  }
}

async function templateDaGarantia(templateId: string | null): Promise<GarantiaTemplate> {
  const tpl = templateId ? await getTemplate(templateId) : await getDefaultTemplate()
  if (!tpl) throw new Error('Template da garantia não encontrado.')
  return tpl
}

function rpcErro(error: { message: string }): Error {
  return new Error(error.message)
}

/** Atribui número+código (idempotente) e devolve ambos. Repete com outro código se houver colisão (muito improvável). */
async function garantirNumero(id: string): Promise<{ numero: string; codigo: string }> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const { data, error } = await supabaseAdmin.rpc('atribuir_numero_garantia', {
      p_id: id,
      p_codigo: gerarCodigoVerificacao(),
    })
    if (!error) {
      const g = await getGarantia(id)
      if (!g?.codigo_verificacao) throw new Error('Falha ao atribuir o código de verificação.')
      return { numero: String(data), codigo: g.codigo_verificacao }
    }
    if (!/unique|duplicate/i.test(error.message)) throw rpcErro(error)
  }
  throw new Error('Não foi possível gerar um código de verificação único.')
}

/** Emite a versão 1 de um rascunho. */
export async function emitirGarantia(id: string, user: AdminUser): Promise<{ numero: string; versao: number }> {
  const g = await getGarantia(id)
  if (!g) throw new Error('Garantia não encontrada.')
  if (g.estado !== 'rascunho') throw new Error('Esta garantia já foi emitida.')

  const dados = paraInput(g)
  const faltam = validarParaEmissao(dados)
  if (faltam.length) throw new Error(`Faltam dados para emitir: ${faltam.join('; ')}.`)

  const tpl = await templateDaGarantia(g.template_id)
  const { numero, codigo } = await garantirNumero(id)
  const snapshot = construirSnapshot(dados, tpl, numero, 1, codigo)

  const { data, error } = await supabaseAdmin.rpc('emitir_versao_garantia', {
    p_id: id,
    p_dados: snapshot,
    p_motivo: null,
    p_user_id: user.id,
    p_user_email: user.email,
  })
  if (error) throw rpcErro(error)
  return { numero, versao: Number(data) }
}

/** Nova versão de uma garantia já emitida/assinada. Exige motivo e fica registada. */
export async function emitirNovaVersao(
  id: string,
  input: GarantiaInput,
  motivo: string,
  user: AdminUser,
): Promise<{ numero: string; versao: number }> {
  const g = await getGarantia(id)
  if (!g) throw new Error('Garantia não encontrada.')
  if (g.estado !== 'emitida' && g.estado !== 'assinada') {
    throw new Error('Só se criam novas versões de garantias emitidas ou assinadas.')
  }
  if (!motivo.trim()) throw new Error('Indica o motivo da nova versão.')
  if (!g.numero || !g.codigo_verificacao) throw new Error('Garantia sem número — estado inconsistente.')

  const limpo = limparInput(input)
  let tpl = await templateDaGarantia(g.template_id)
  let prazo = g.prazo_meses // o prazo só muda se o admin trocar de template
  if (limpo.template_id && limpo.template_id !== g.template_id) {
    tpl = await templateDaGarantia(limpo.template_id)
    if (!tpl.ativo) throw new Error('Template desativado.')
    prazo = tpl.prazo_meses
  }
  const dados = { ...limpo, template_id: tpl.id, prazo_meses: prazo }
  const faltam = validarParaEmissao(dados)
  if (faltam.length) throw new Error(`Faltam dados para emitir: ${faltam.join('; ')}.`)

  const versao = g.versao_atual + 1
  const snapshot = construirSnapshot(dados, tpl, g.numero, versao, g.codigo_verificacao)
  const { data, error } = await supabaseAdmin.rpc('emitir_versao_garantia', {
    p_id: id,
    p_dados: snapshot,
    p_motivo: motivo.trim(),
    p_user_id: user.id,
    p_user_email: user.email,
  })
  if (error) throw rpcErro(error)
  return { numero: g.numero, versao: Number(data) }
}

export async function anularGarantia(id: string, motivo: string, user: AdminUser) {
  const { error } = await supabaseAdmin.rpc('anular_garantia', {
    p_id: id,
    p_motivo: motivo,
    p_user_id: user.id,
    p_user_email: user.email,
  })
  if (error) throw rpcErro(error)
}

export async function marcarAssinada(id: string, ficheiro: string, user: AdminUser) {
  const { error } = await supabaseAdmin.rpc('marcar_garantia_assinada', {
    p_id: id,
    p_ficheiro: ficheiro,
    p_user_id: user.id,
    p_user_email: user.email,
  })
  if (error) throw rpcErro(error)
}

// ------------------------------------------------------------- página pública
export interface InfoPublicaGarantia {
  numero: string
  estado: GarantiaEstadoEfetivo
  marca: string
  modelo: string
  prazo_meses: number
  data_inicio: string
  data_fim: string
  versao: number
  emitida_em: string
}

/** Só devolve o que é seguro mostrar: nada de cliente, NIF, matrícula ou VIN. */
export async function infoPublicaPorCodigo(codigo: string): Promise<InfoPublicaGarantia | null> {
  const limpo = codigo.trim().toUpperCase()
  if (!/^[A-Z2-9]{10}$/.test(limpo)) return null

  const { data: g } = await supabaseAdmin
    .from('garantias')
    .select('id, numero, estado, versao_atual, data_fim')
    .eq('codigo_verificacao', limpo)
    .neq('estado', 'rascunho')
    .maybeSingle()
  if (!g || !g.numero) return null

  const versao = await getVersao(g.id as string, g.versao_atual as number)
  if (!versao) return null
  const s = versao.dados
  return {
    numero: s.numero,
    estado: estadoEfetivo({ estado: g.estado as Garantia['estado'], data_fim: s.garantia.data_fim }),
    marca: s.viatura.marca,
    modelo: s.viatura.modelo,
    prazo_meses: s.garantia.prazo_meses,
    data_inicio: s.garantia.data_inicio,
    data_fim: s.garantia.data_fim,
    versao: s.versao,
    emitida_em: s.emitida_em,
  }
}
