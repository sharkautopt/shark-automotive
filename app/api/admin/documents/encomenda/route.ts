import { NextRequest, NextResponse } from "next/server"
import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/service-role"
import { registerPdfFonts } from "@/lib/pdf/theme"
import { generateQrDataUrl } from "@/lib/pdf/helpers"
import { resolvePdfImages } from "@/lib/pdf/images"
import { COMPANY } from "@/lib/pdf/company"
import { EncomendaDocument, type EncomendaDocProps } from "@/components/pdf/encomenda-document"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

interface EncomendaBody {
  mode: "proposta" | "orcamento"
  clientName: string
  leadId?: string
  vehicleId?: string
  vehicle: EncomendaDocProps["vehicle"]
  photos?: string[]
  fromPrice?: number
  deliveryTime?: string
  costs?: EncomendaDocProps["costs"]
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let body: EncomendaBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (!body.mode || !["proposta", "orcamento"].includes(body.mode)) {
    return NextResponse.json({ error: "Modo inválido" }, { status: 400 })
  }
  if (!body.clientName?.trim()) {
    return NextResponse.json({ error: "Nome do cliente em falta" }, { status: 400 })
  }
  if (!body.vehicle?.make || !body.vehicle?.model) {
    return NextResponse.json({ error: "Dados do veículo em falta" }, { status: 400 })
  }
  if (body.mode === "orcamento" && !body.costs) {
    return NextResponse.json({ error: "Estrutura de custos em falta para orçamento" }, { status: 400 })
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString("pt-PT")

  // Formal quote numbering (ORC-YYYY-NNN) via DB sequence for uniqueness.
  let documentNumber: string | undefined
  if (body.mode === "orcamento") {
    const { data: seq, error: seqErr } = await supabaseAdmin.rpc("nextval_orcamento")
    if (seqErr || seq == null) {
      // Fallback to a timestamp-based number if the RPC is unavailable.
      documentNumber = `ORC-${now.getFullYear()}-${String(now.getTime()).slice(-4)}`
    } else {
      documentNumber = `ORC-${now.getFullYear()}-${String(seq).padStart(3, "0")}`
    }
  }

  // Validity: 15 days from now for orçamento.
  const validUntil = new Date(now.getTime() + 15 * 86400000).toLocaleDateString("pt-PT")

  // QR: link to inventory item if vehicle-based, else to the site.
  const origin = request.nextUrl.origin || COMPANY.siteUrl
  const qrTarget = body.vehicleId ? `${origin}/inventario/${body.vehicleId}` : COMPANY.siteUrl
  const qrDataUrl = await generateQrDataUrl(qrTarget)

  registerPdfFonts()

  // Pre-fetch photos server-side and embed as JPEG data URIs — react-pdf's own
  // remote fetching is unreliable and it cannot decode WebP/AVIF uploads.
  const photos = await resolvePdfImages((body.photos || []).slice(0, 5))

  const docProps: EncomendaDocProps = {
    mode: body.mode,
    clientName: body.clientName.trim(),
    vehicle: body.vehicle,
    photos,
    qrDataUrl,
    fromPrice: body.fromPrice,
    documentNumber,
    date: dateStr,
    validUntil,
    deliveryTime: body.deliveryTime,
    costs: body.costs,
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(createElement(EncomendaDocument, docProps))
  } catch (err) {
    console.log("[v0] Encomenda render failed:", (err as Error).message)
    return NextResponse.json({ error: "Falha ao gerar o PDF" }, { status: 500 })
  }

  const docTypeSlug = body.mode === "orcamento" ? "encomenda_orcamento" : "encomenda_proposta"
  const filename = `encomendas/${docTypeSlug}-${Date.now()}.pdf`
  const { error: upErr } = await supabase.storage
    .from("documents")
    .upload(filename, pdfBuffer, { contentType: "application/pdf", upsert: true })

  if (upErr) {
    console.log("[v0] Encomenda upload failed:", upErr.message)
    return NextResponse.json({ error: "Falha ao guardar o PDF" }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filename)

  const title =
    body.mode === "orcamento"
      ? `Orçamento ${documentNumber} — ${body.clientName.trim()}`
      : `Proposta ${body.vehicle.make} ${body.vehicle.model} — ${body.clientName.trim()}`

  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: docTypeSlug,
      vehicle_id: body.vehicleId ?? null,
      lead_id: body.leadId ?? null,
      title,
      storage_path: filename,
      public_url: publicUrl,
      client_name: body.clientName.trim(),
      document_number: documentNumber ?? null,
      // Persist original photo URLs, not the embedded data URIs used for rendering.
      snapshot: { ...docProps, photos: (body.photos || []).slice(0, 5) } as unknown as Record<string, unknown>,
      generated_by: user.email ?? null,
    })
    .select("id, public_url, title, created_at")
    .single()

  if (docErr) {
    console.log("[v0] Encomenda record failed:", docErr.message)
    return NextResponse.json({ success: true, publicUrl, title, warning: "Documento gerado mas não registado." })
  }

  return NextResponse.json({ success: true, ...doc, publicUrl })
}
