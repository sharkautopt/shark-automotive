import { createElement } from 'react'
import { validationUrl } from './template'
import type { GarantiaVersao } from './types'

async function loadModule<T>(name: string, loader: () => Promise<T>): Promise<T> {
  try {
    return await loader()
  } catch (err) {
    throw new Error(`Falha ao carregar ${name}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** Gera o PDF de uma versão a partir do snapshot congelado (nunca dos dados "vivos" da garantia). */
export async function renderGarantiaPdf(versao: GarantiaVersao): Promise<Buffer> {
  const [{ renderToBuffer }, { registerPdfFontsV2 }, { GarantiaDocument }, { generateQrDataUrl }] = await Promise.all([
    loadModule('@react-pdf/renderer', () => import('@react-pdf/renderer')),
    loadModule('lib/pdf/theme-v2', () => import('@/lib/pdf/theme-v2')),
    loadModule('components/pdf/garantia', () => import('@/components/pdf/garantia')),
    loadModule('lib/pdf/helpers', () => import('@/lib/pdf/helpers')),
  ])
  registerPdfFontsV2()
  const qrDataUrl = await generateQrDataUrl(validationUrl(versao.dados.codigo_verificacao))
  return renderToBuffer(
    createElement(GarantiaDocument, { snapshot: versao.dados, qrDataUrl, hash: versao.hash_sha256 }) as never,
  )
}
