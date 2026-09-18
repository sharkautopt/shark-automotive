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
  mode: "proposta" | "orcamento"
}

export async function POST(request: NextRequest) {
  try {
    return await createDocument(request)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[documents] importacao unhandled:", message)
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
  if (!body.operationId || !["proposta", "orcamento"].includes(body.mode)) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 })
  }

  const [{ renderToBuffer }, { registerPdfFontsV2 }, propostaMod, orcamentoMod, helpers, { supabaseAdmin }] = await Promise.all([
    loadModule("@react-pdf/renderer", () => import("@react-pdf/renderer")),
    loadModule("lib/pdf/theme-v2", () => import("@/lib/pdf/theme-v2")),
    loadModule("components/pdf/proposta-importacao", () => import("@/components/pdf/proposta-importacao")),
    loadModule("components/pdf/orcamento-importacao", () => import("@/components/pdf/orcamento-importacao")),
    loadModule("lib/pdf/operation-doc-helpers", () => import("@/lib/pdf/operation-doc-helpers")),
    loadModule("lib/supabase/service-role", () => import("@/lib/supabase/service-role")),
  ])

  const { operation, profile } = await helpers.loadOperationDocData(body.operationId)
  const now = new Date()
  const emittedDate = helpers.formatLongDatePt(now)

  registerPdfFontsV2()

  let documentNumber: string
  let pdfBuffer: Buffer
  let docTypeSlug: string
  let title: string

  if (body.mode === "proposta") {
    const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_proposta_importacao")
    documentNumber = seqErr || seq == null
      ? `PI-${now.getFullYear()}/${String(now.getTime()).slice(-4)}`
      : helpers.formatDocNumber("PI", now.getFullYear(), Number(seq))
    docTypeSlug = "proposta_importacao"
    title = `Proposta de Importação ${documentNumber} — ${profile.full_name ?? ""}`

    const anoKmMax = [
      operation.desired_year_min ? `${operation.desired_year_min} ou superior` : null,
      operation.desired_km_max ? `até ${operation.desired_km_max.toLocaleString("pt-PT")} km` : null,
    ].filter(Boolean).join(" · ")

    const props = {
      documentNumber,
      emittedDate,
      cliente: {
        nome: profile.full_name ?? "",
        nif: profile.nif ?? "",
        morada: profile.morada ?? "",
        contacto: profile.phone ?? "",
      },
      viatura: {
        marcaModelo: [operation.desired_make, operation.desired_model].filter(Boolean).join(" "),
        segmento: operation.desired_segmento ?? "",
        origem: operation.desired_origem ?? "",
        anoKmMax,
        combustivel: operation.desired_fuel_type ?? "",
        caixa: operation.desired_transmission ?? "",
        equipamentoExigido: operation.desired_equipment_notes ?? "",
      },
      condicoes: {
        orcamentoMaximo: operation.budget_max != null ? `${operation.budget_max.toLocaleString("pt-PT")} €` : "—",
        sinal: operation.sinal_adjudicacao != null ? `${operation.sinal_adjudicacao.toLocaleString("pt-PT")} €` : "—",
        prazoEntrega: operation.prazo_entrega_estimado ?? "—",
        validade: `${operation.proposta_validade_dias ?? 15} dias a contar da data de emissão`,
      },
    }

    try {
      pdfBuffer = await renderToBuffer(createElement(propostaMod.PropostaImportacaoDocument, props) as never)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
    }
  } else {
    const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_orcamento_importacao")
    documentNumber = seqErr || seq == null
      ? `OR-${now.getFullYear()}/${String(now.getTime()).slice(-4)}`
      : helpers.formatDocNumber("OR", now.getFullYear(), Number(seq))
    docTypeSlug = "orcamento_importacao"
    title = `Orçamento de Importação ${documentNumber} — ${profile.full_name ?? ""}`

    const precoOrigem = operation.vehicle_price_origin ?? 0
    const isv = operation.isv_estimado ?? 0
    const taxaServico = operation.taxa_servico ?? 0

    const props = {
      documentNumber,
      propostaNumber: null,
      emittedDate,
      viatura: {
        marcaModelo: [operation.vehicle_make, operation.vehicle_model].filter(Boolean).join(" "),
        ano: operation.vehicle_year?.toString() ?? "",
        quilometragem: operation.vehicle_km != null ? `${operation.vehicle_km.toLocaleString("pt-PT")} km` : "",
        origem: operation.vehicle_country_origin ?? "",
        cilindrada: operation.vehicle_engine_size ?? "",
        co2: operation.vehicle_co2_emissions != null ? `${operation.vehicle_co2_emissions} g/km` : "",
        matriculaOrigem: operation.vehicle_foreign_plate ?? "",
        vin: operation.vehicle_vin ?? "",
      },
      fotoOrigem: operation.vehicle_photo_url,
      custos: {
        precoOrigem,
        isv,
        taxaServico,
        total: precoOrigem + isv + taxaServico,
      },
    }

    try {
      pdfBuffer = await renderToBuffer(createElement(orcamentoMod.OrcamentoImportacaoDocument, props) as never)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
    }
  }

  const filename = `importacao/${docTypeSlug}-${body.operationId}-${Date.now()}.pdf`
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

  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: docTypeSlug,
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
