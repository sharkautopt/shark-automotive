'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminUser } from '@/lib/garantias/auth'
import {
  anularGarantia,
  criarRascunhoDaOperacao,
  duplicateTemplate,
  emitirGarantia,
  emitirNovaVersao,
  guardarRascunho,
  saveTemplate,
  setTemplateAtivo,
  setTemplateDefault,
  type TemplateInput,
} from '@/lib/garantias/service'
import type { GarantiaInput } from '@/lib/garantias/types'

export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string }

function mensagem(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err)
  // Migração 005 ainda não corrida: mensagem útil em vez de um erro críptico do PostgREST.
  if (/garantia/i.test(m) && /(does not exist|schema cache|could not find)/i.test(m)) {
    return 'Falta correr a migração 005_garantias.sql no Supabase.'
  }
  return m
}

async function run<T extends object>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, ...(await fn()) }
  } catch (err) {
    return { ok: false, error: mensagem(err) }
  }
}

function refresh(operationId?: string, garantiaId?: string) {
  revalidatePath('/admin/garantias')
  if (garantiaId) revalidatePath(`/admin/garantias/${garantiaId}`)
  if (operationId) revalidatePath(`/admin/operacoes/${operationId}`)
}

export async function criarGarantiaDaOperacao(operationId: string) {
  return run(async () => {
    const user = await requireAdminUser()
    const g = await criarRascunhoDaOperacao(operationId, user)
    refresh(operationId)
    return { id: g.id }
  })
}

export async function guardarRascunhoAction(id: string, input: GarantiaInput) {
  return run(async () => {
    const user = await requireAdminUser()
    const g = await guardarRascunho(id, input, user)
    refresh(g.operation_id, id)
    return {}
  })
}

export async function emitirGarantiaAction(id: string, input?: GarantiaInput) {
  return run(async () => {
    const user = await requireAdminUser()
    // Grava primeiro o que está no formulário, para emitir exatamente o que o admin vê.
    if (input) await guardarRascunho(id, input, user)
    const r = await emitirGarantia(id, user)
    refresh(undefined, id)
    return { numero: r.numero, versao: r.versao }
  })
}

export async function novaVersaoAction(id: string, input: GarantiaInput, motivo: string) {
  return run(async () => {
    const user = await requireAdminUser()
    const r = await emitirNovaVersao(id, input, motivo, user)
    refresh(undefined, id)
    return { numero: r.numero, versao: r.versao }
  })
}

export async function anularGarantiaAction(id: string, motivo: string) {
  return run(async () => {
    const user = await requireAdminUser()
    await anularGarantia(id, motivo, user)
    refresh(undefined, id)
    return {}
  })
}

export async function guardarTemplateAction(input: TemplateInput) {
  return run(async () => {
    const user = await requireAdminUser()
    const t = await saveTemplate(input, user)
    revalidatePath('/admin/garantias/templates')
    return { id: t.id }
  })
}

export async function duplicarTemplateAction(id: string) {
  return run(async () => {
    const user = await requireAdminUser()
    const t = await duplicateTemplate(id, user)
    revalidatePath('/admin/garantias/templates')
    return { id: t.id }
  })
}

export async function tornarTemplatePadraoAction(id: string) {
  return run(async () => {
    const user = await requireAdminUser()
    await setTemplateDefault(id, user)
    revalidatePath('/admin/garantias/templates')
    return {}
  })
}

export async function ativarTemplateAction(id: string, ativo: boolean) {
  return run(async () => {
    const user = await requireAdminUser()
    await setTemplateAtivo(id, ativo, user)
    revalidatePath('/admin/garantias/templates')
    return {}
  })
}
