import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildWindowSticker } from "@/lib/pdf/build-window-sticker"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let body: { vehicleId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (!body.vehicleId) {
    return NextResponse.json({ error: "vehicleId em falta" }, { status: 400 })
  }

  let built
  try {
    built = await buildWindowSticker(supabase, body.vehicleId, request.nextUrl.origin)
  } catch (err) {
    console.log("[v0] Window sticker render failed:", (err as Error).message)
    return NextResponse.json({ error: "Falha ao gerar o PDF" }, { status: 500 })
  }

  if (!built) {
    return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })
  }

  const { buffer, vehicle, heroPhoto } = built

  // Upload to storage for the document history.
  const filename = `window-stickers/${vehicle.id}-${Date.now()}.pdf`
  const { error: upErr } = await supabase.storage
    .from("documents")
    .upload(filename, buffer, { contentType: "application/pdf", upsert: true })

  if (upErr) {
    console.log("[v0] Window sticker upload failed:", upErr.message)
    return NextResponse.json({ error: "Falha ao guardar o PDF" }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filename)

  const title = `Ficha ${vehicle.make} ${vehicle.model} ${vehicle.year}`
  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: "window_sticker",
      vehicle_id: vehicle.id,
      title,
      storage_path: filename,
      public_url: publicUrl,
      snapshot: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        protocol_score: vehicle.protocol_score,
        heroPhoto,
      },
      generated_by: user.email ?? null,
    })
    .select("id, public_url, title, created_at")
    .single()

  if (docErr) {
    console.log("[v0] Window sticker record failed:", docErr.message)
    return NextResponse.json({ success: true, publicUrl, title, warning: "Documento gerado mas não registado." })
  }

  return NextResponse.json({ success: true, ...doc, publicUrl })
}
