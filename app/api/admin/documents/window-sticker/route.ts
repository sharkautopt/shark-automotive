import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// lib/pdf/build-window-sticker transitively pulls in @react-pdf/renderer and
// the font/image pipeline. Loaded lazily (see the encomenda route for the
// same pattern) so a crash there surfaces as a JSON error naming the module,
// not Next.js's default HTML error page from a module-load-time crash.
async function loadModule<T>(name: string, loader: () => Promise<T>): Promise<T> {
  try {
    return await loader()
  } catch (err) {
    throw new Error(`Falha ao carregar ${name}: ${(err as Error).message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    return await createWindowSticker(request)
  } catch (err) {
    console.error("[documents] unhandled window sticker error:", err)
    return NextResponse.json({ error: (err as Error).message || "Falha ao gerar o PDF" }, { status: 500 })
  }
}

async function createWindowSticker(request: NextRequest) {
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

  const { buildWindowSticker } = await loadModule("lib/pdf/build-window-sticker", () =>
    import("@/lib/pdf/build-window-sticker"),
  )

  let built
  try {
    built = await buildWindowSticker(supabase, body.vehicleId, request.nextUrl.origin)
  } catch (err) {
    console.error("[v0] Window sticker render failed:", (err as Error).message)
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
    console.error("[v0] Window sticker upload failed:", upErr.message)
    return NextResponse.json({ error: "Falha ao guardar o PDF" }, { status: 500 })
  }

  const { data: signed, error: signErr } = await supabase.storage.from("documents").createSignedUrl(filename, 60 * 15)
  if (signErr || !signed?.signedUrl) {
    console.error("[v0] Window sticker signed URL failed:", signErr?.message)
    return NextResponse.json({ error: `Falha ao criar link do PDF: ${signErr?.message || "URL indisponível"}` }, { status: 500 })
  }
  const signedUrl = signed.signedUrl

  const title = `Ficha ${vehicle.make} ${vehicle.model} ${vehicle.year}`
  const { data: doc, error: docErr } = await supabase
    .from("generated_documents")
    .insert({
      doc_type: "window_sticker",
      vehicle_id: vehicle.id,
      title,
      storage_path: filename,
      public_url: null,
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
    console.error("[v0] Window sticker record failed:", docErr.message)
    return NextResponse.json({ success: true, signedUrl, title, warning: "Documento gerado mas não registado." })
  }

  return NextResponse.json({ success: true, ...doc, signedUrl })
}
