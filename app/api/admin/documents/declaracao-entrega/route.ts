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
  quilometragem?: string
  local?: string
  chavesEntregues?: string
  nivelCombustivel?: string
  observacoes?: string
  checklist?: boolean[]
}

export async function POST(request: NextRequest) {
  try {
    return await createDocument(request)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[documents] declaracao-entrega unhandled:", message)
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

  const [{ renderToBuffer }, { registerPdfFontsV2 }, docMod, helpers, { supabaseAdmin }] = await Promise.all([
    loadModule("@react-pdf/renderer", () => import("@react-pdf/renderer")),
    loadModule("lib/pdf/theme-v2", () => import("@/lib/pdf/theme-v2")),
    loadModule("components/pdf/declaracao-entrega", () => import("@/components/pdf/declaracao-entrega")),
    loadModule("lib/pdf/operation-doc-helpers", () => import("@/lib/pdf/operation-doc-helpers")),
    loadModule("lib/supabase/service-role", () => import("@/lib/supabase/service-role")),
  ])

  const { operation, profile } = await helpers.loadOperationDocData(body.operationId)
  const now = new Date()

  let documentNumber: string
  const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_declaracao_entrega")
  documentNumber = seqErr || seq == null
    ? `DE-${now.getFullYear()}/${String(now.getTime()).slice(-4)}`
    : helpers.formatDocNumber("DE", now.getFullYear(), Number(seq))

  registerPdfFontsV2()

  const props = {
    documentNumber,
    emittedDate: helpers.formatLongDatePt(now),
    veiculo: {
      marcaModelo: [operation.vehicle_make, operation.vehicle_model].filter(Boolean).join(" "),
      matricula: operation.vehicle_plate ?? "",
    },
    entrega: {
      quilometragem: body.quilometragem || (operation.vehicle_km != null ? `${operation.vehicle_km.toLocaleString("pt-PT")} km` : ""),
      localData: `${body.local || "Lisboa"}, ${now.toLocaleDateString("pt-PT")}`,
      chavesEntregues: body.chavesEntregues || "2",
      nivelCombustivel: body.nivelCombustivel || "",
      observacoes: body.observacoes || "",
      checklist: body.checklist && body.checklist.length === 8 ? body.checklist : Array(8).fill(true),
    },
    clienteNome: profile.full_name ?? "",
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(createElement(docMod.DeclaracaoEntregaDocument, props) as never)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
  }

  const filename = `declaracoes-entrega/${body.operationId}-${Date.now()}.pdf`
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

  const title = `Declaração de Entrega ${documentNumber} — ${profile.full_name ?? ""}`
  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: "declaracao_entrega",
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
