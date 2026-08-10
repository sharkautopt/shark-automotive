import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/service-role"
import { buildWindowSticker } from "@/lib/pdf/build-window-sticker"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Public, on-the-fly window-sticker ("ficha") download for a listed vehicle.
 * Only vehicles that are publicly visible (available/reserved/sold) may be
 * downloaded — anything else returns 404 so unpublished stock stays private.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Guard: only publicly listed vehicles.
  const { data: listed } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", id)
    .in("status", ["available", "reserved", "sold"])
    .maybeSingle()

  if (!listed) {
    return NextResponse.json({ error: "Viatura não disponível" }, { status: 404 })
  }

  let built
  try {
    // The public visibility check stays user-scoped; PDF data loading uses the
    // server client so RLS cannot make a visible vehicle look unavailable.
    built = await buildWindowSticker(supabaseAdmin, id, request.nextUrl.origin)
  } catch (err) {
    console.log("[v0] Public ficha render failed:", (err as Error).message)
    return NextResponse.json({ error: "Falha ao gerar a ficha" }, { status: 500 })
  }

  if (!built) {
    return NextResponse.json({ error: "Viatura não encontrada" }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(built.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${built.filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  })
}
