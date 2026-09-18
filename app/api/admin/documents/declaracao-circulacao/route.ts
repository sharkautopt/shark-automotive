import { NextRequest, NextResponse } from "next/server"
import { createElement } from "react"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Same pattern as app/api/admin/documents/encomenda/route.ts: heavy imports
// loaded lazily, wrapped in loadModule(), so a crash at module-load time
// surfaces as a JSON error naming the module instead of Next's HTML page.
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
    console.error("[documents] declaracao-circulacao unhandled:", message)
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
    loadModule("components/pdf/declaracao-circulacao", () => import("@/components/pdf/declaracao-circulacao")),
    loadModule("lib/pdf/operation-doc-helpers", () => import("@/lib/pdf/operation-doc-helpers")),
    loadModule("lib/supabase/service-role", () => import("@/lib/supabase/service-role")),
  ])

  const { operation, profile } = await helpers.loadOperationDocData(body.operationId)

  const now = new Date()
  let documentNumber: string
  const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_declaracao_circulacao")
  if (seqErr || seq == null) {
    documentNumber = `DC-${now.getFullYear()}/${String(now.getTime()).slice(-4)}`
  } else {
    documentNumber = helpers.formatDocNumber("DC", now.getFullYear(), Number(seq))
  }

  registerPdfFontsV2()

  const props = {
    documentNumber,
    emittedDate: now.toLocaleDateString("pt-PT"),
    cliente: {
      nome: profile.full_name ?? "",
      nif: profile.nif ?? "",
      morada: profile.morada ?? "",
    },
    viatura: {
      matricula: operation.vehicle_plate ?? "",
      tipoMatricula: operation.vehicle_foreign_plate ? "Mat. Estrangeira" : "Mat. Nacional",
      marcaModelo: [operation.vehicle_make, operation.vehicle_model].filter(Boolean).join(" / "),
      dataPrimeiraMatricula: operation.vehicle_national_registration_date
        ? new Date(operation.vehicle_national_registration_date).toLocaleDateString("pt-PT")
        : "",
      dataMatriculaNacional: operation.vehicle_national_registration_date
        ? new Date(operation.vehicle_national_registration_date).toLocaleDateString("pt-PT")
        : "",
      anoConstrucao: operation.vehicle_year?.toString() ?? "",
      cor: operation.vehicle_colour ?? "",
      vin: operation.vehicle_vin ?? "",
      categoria: operation.vehicle_categoria ?? "",
      cilindrada: operation.vehicle_engine_size ?? "",
      potencia: operation.vehicle_power ? `${operation.vehicle_power}` : "",
      combustivel: operation.vehicle_fuel_type ?? "",
      lotacao: "",
      pesoBruto: operation.vehicle_peso_bruto_kg ? `${operation.vehicle_peso_bruto_kg}` : "",
      tara: operation.vehicle_tara_kg ? `${operation.vehicle_tara_kg}` : "",
      portas: operation.vehicle_doors?.toString() ?? "",
      co2: operation.vehicle_co2_emissions ? `${operation.vehicle_co2_emissions}` : "",
    },
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(createElement(docMod.DeclaracaoCirculacaoDocument, props) as never)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[documents] declaracao-circulacao render failed:", message)
    return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
  }

  const filename = `declaracoes-circulacao/${body.operationId}-${Date.now()}.pdf`
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

  const title = `Declaração de Circulação ${documentNumber} — ${profile.full_name ?? ""}`
  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: "declaracao_circulacao",
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
