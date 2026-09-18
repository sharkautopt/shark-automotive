import { NextRequest, NextResponse } from "next/server"
import { createElement } from "react"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

async function loadModule<T>(name: string, loader: () => Promise<T>): Promise<T> {
  try {
    return await loader()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Falha ao carregar ${name}: ${message}`)
  }
}

interface Body {
  operationId: string
}

export async function POST(request: NextRequest) {
  try {
    return await createDocument(request)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[documents] contrato unhandled:", message)
    return NextResponse.json({ error: message || "Erro interno ao criar o documento." }, { status: 500 })
  }
}

async function createDocument(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  if (!body.operationId) {
    return NextResponse.json({ error: "operationId em falta" }, { status: 400 })
  }

  const [{ renderToBuffer }, { registerPdfFontsV2 }, docMod, helpers, numberWords, { supabaseAdmin }] = await Promise.all([
    loadModule("@react-pdf/renderer", () => import("@react-pdf/renderer")),
    loadModule("lib/pdf/theme-v2", () => import("@/lib/pdf/theme-v2")),
    loadModule("components/pdf/contrato-compra-venda", () => import("@/components/pdf/contrato-compra-venda")),
    loadModule("lib/pdf/operation-doc-helpers", () => import("@/lib/pdf/operation-doc-helpers")),
    loadModule("lib/pdf/number-to-words-pt", () => import("@/lib/pdf/number-to-words-pt")),
    loadModule("lib/supabase/service-role", () => import("@/lib/supabase/service-role")),
  ])

  const { operation, profile } = await helpers.loadOperationDocData(body.operationId)
  const now = new Date()

  registerPdfFontsV2()

  const precoVeiculo = operation.vehicle_price_origin ?? 0
  const isv = operation.isv_estimado ?? 0
  const taxaServico = operation.taxa_servico ?? 0
  const sinal = operation.sinal_adjudicacao ?? 0
  const total = precoVeiculo + isv + taxaServico
  const remanescente = Math.max(0, taxaServico - sinal)

  const fmt = (n: number) => `${n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`

  let documentNumber: string
  const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_contrato")
  documentNumber = seqErr || seq == null
    ? `CT-${now.getFullYear()}/${String(now.getTime()).slice(-4)}`
    : helpers.formatDocNumber("CT", now.getFullYear(), Number(seq))

  const props = {
    documentNumber,
    emittedDate: helpers.formatLongDatePt(now),
    comprador: {
      nome: profile.full_name ?? "",
      nif: profile.nif ?? "",
      idDocumento: profile.id_document_number ?? "",
      morada: profile.morada ?? "",
    },
    viatura: {
      marca: operation.vehicle_make ?? "",
      modelo: operation.vehicle_model ?? "",
      ano: operation.vehicle_year?.toString() ?? "",
      vin: operation.vehicle_vin ?? "",
      cilindrada: operation.vehicle_engine_size ?? "",
      matricula: operation.vehicle_plate ?? "",
      km: operation.vehicle_km?.toLocaleString("pt-PT") ?? "",
    },
    precoTotal: fmt(total),
    precoTotalExtenso: numberWords.euroAmountInWords(total),
    precoVeiculo: fmt(precoVeiculo),
    isv: fmt(isv),
    taxaServico: fmt(taxaServico),
    sinalPago: fmt(sinal),
    remanescente: fmt(remanescente),
    iban: "PT50 0033 0000 4584 3610 1870 5",
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(createElement(docMod.ContratoCompraVendaDocument, props) as never)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
  }

  const filename = `contratos/${body.operationId}-${Date.now()}.pdf`
  const { error: upErr } = await supabase.storage
    .from("documents")
    .upload(filename, pdfBuffer, { contentType: "application/pdf", upsert: true })
  if (upErr) {
    return NextResponse.json({ error: "Falha ao guardar o PDF" }, { status: 500 })
  }

  const { data: signed, error: signErr } = await supabase.storage.from("documents").createSignedUrl(filename, 60 * 15)
  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: `Falha ao criar link do PDF: ${signErr?.message || "URL indisponível"}` }, { status: 500 })
  }

  const title = `Contrato de Compra e Venda ${documentNumber} — ${profile.full_name ?? ""}`
  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: "contrato_compra_venda",
      operation_id: body.operationId,
      title,
      storage_path: filename,
      public_url: null,
      client_name: profile.full_name ?? null,
      document_number: documentNumber,
      generated_by: user.email ?? null,
    })
    .select("id, title, created_at")
    .single()

  if (docErr) {
    return NextResponse.json({ success: true, signedUrl: signed.signedUrl, title, warning: "Documento gerado mas não registado." })
  }

  return NextResponse.json({ success: true, ...doc, signedUrl: signed.signedUrl })
}
