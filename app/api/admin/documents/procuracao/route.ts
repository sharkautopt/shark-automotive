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
  /** Explicit admin confirmation that the mandante's ID data was reviewed —
   * required, since a wrong NIF/ID number on a power of attorney is a real
   * legal problem, not just a typo. */
  confirmed: boolean
}

export async function POST(request: NextRequest) {
  try {
    return await createDocument(request)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[documents] procuracao unhandled:", message)
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
  if (!body.confirmed) {
    return NextResponse.json({ error: "Confirmação dos dados de identificação do mandante em falta" }, { status: 400 })
  }

  const [{ renderToBuffer }, { registerPdfFontsV2 }, docMod, helpers, { supabaseAdmin }] = await Promise.all([
    loadModule("@react-pdf/renderer", () => import("@react-pdf/renderer")),
    loadModule("lib/pdf/theme-v2", () => import("@/lib/pdf/theme-v2")),
    loadModule("components/pdf/procuracao", () => import("@/components/pdf/procuracao")),
    loadModule("lib/pdf/operation-doc-helpers", () => import("@/lib/pdf/operation-doc-helpers")),
    loadModule("lib/supabase/service-role", () => import("@/lib/supabase/service-role")),
  ])

  const { operation, profile } = await helpers.loadOperationDocData(body.operationId)

  if (!profile.nif || !profile.id_document_number || !profile.birth_date || !profile.morada) {
    return NextResponse.json(
      { error: "Dados do cliente incompletos para a procuração (NIF, documento de identificação, data de nascimento ou morada em falta). Peça ao cliente para os preencher em Definições, ou preencha-os no separador Viatura." },
      { status: 400 },
    )
  }

  const now = new Date()
  let documentNumber: string
  const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_procuracao")
  documentNumber = seqErr || seq == null
    ? `PR-${now.getFullYear()}/${String(now.getTime()).slice(-4)}`
    : helpers.formatDocNumber("PR", now.getFullYear(), Number(seq))

  registerPdfFontsV2()

  const validade = profile.id_document_validity ? new Date(profile.id_document_validity).toLocaleDateString("pt-PT") : ""
  const nascimento = new Date(profile.birth_date).toLocaleDateString("pt-PT")

  const props = {
    documentNumber,
    emittedDate: helpers.formatLongDatePt(now),
    mandante: {
      nomeCompleto: profile.full_name ?? "",
      nif: profile.nif ?? "",
      documentoIdentificacao: `Cartão de Cidadão n.º ${profile.id_document_number}${validade ? `, válido até ${validade}` : ""}`,
      dataNascimento: nascimento,
      morada: profile.morada ?? "",
    },
    viatura: {
      marcaModelo: [operation.vehicle_make, operation.vehicle_model].filter(Boolean).join(" "),
      vin: operation.vehicle_vin ?? "",
      matriculaOrigem: operation.vehicle_foreign_plate ?? "",
    },
    localData: `${profile.morada?.split(",").pop()?.trim() || "Lisboa"}, ${now.toLocaleDateString("pt-PT")}`,
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(createElement(docMod.ProcuracaoDocument, props) as never)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
  }

  const filename = `procuracoes/${body.operationId}-${Date.now()}.pdf`
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

  const title = `Procuração ${documentNumber} — ${profile.full_name ?? ""}`
  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: "procuracao",
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
