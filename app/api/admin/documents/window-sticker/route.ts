import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
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

  // Auth is checked above with the user's session. PDF generation/storage uses
  // the server-only key so RLS/storage policies cannot break admin generation.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    console.log("[v0] Window sticker missing Supabase server credentials")
    return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 })
  }

  const adminSupabase = createSupabaseClient(
    supabaseUrl,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

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
    built = await buildWindowSticker(adminSupabase, body.vehicleId, request.nextUrl.origin)
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido"
    console.log("[v0] Window sticker render failed:", message)
    return NextResponse.json({ error: `Falha ao gerar o PDF: ${message}` }, { status: 500 })
  }

  if (!built) {
    console.log("[v0] Window sticker vehicle lookup returned no vehicle:", body.vehicleId)
    return NextResponse.json({ error: "Veículo não encontrado ou sem acesso" }, { status: 404 })
  }

  const { buffer, vehicle, heroPhoto } = built

  // Upload to storage for the document history.
  const filename = `window-stickers/${vehicle.id}-${Date.now()}.pdf`
  const { error: upErr } = await adminSupabase.storage
    .from("documents")
    .upload(filename, buffer, { contentType: "application/pdf", upsert: true })

  if (upErr) {
    console.log("[v0] Window sticker upload failed:", upErr.message)
    return NextResponse.json({ error: "Falha ao guardar o PDF" }, { status: 500 })
  }

  // Documents storage is private in production, so generate a usable signed URL
  // instead of returning a public URL that often opens as an error/blank page.
  const { data: signed, error: signedErr } = await adminSupabase.storage
    .from("documents")
    .createSignedUrl(filename, 60 * 60)

  if (signedErr || !signed?.signedUrl) {
    console.log("[v0] Window sticker signed URL failed:", signedErr?.message)
    return NextResponse.json({ error: "Falha ao criar o link do PDF" }, { status: 500 })
  }

  const publicUrl = signed.signedUrl
  const title = `Ficha ${vehicle.make} ${vehicle.model} ${vehicle.year}`
  const { data: doc, error: docErr } = await adminSupabase
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
  }

  // Return the actual PDF bytes. This avoids browser/storage URL issues and
  // makes generation work even when the documents bucket is private.
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${built.filename}"`,
      "Cache-Control": "no-store",
      "X-Document-Url": publicUrl,
      "X-Document-Title": title,
    },
  })
}
