import { NextRequest, NextResponse } from "next/server"
import { parseListingText } from "@/lib/ai/listing-parser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Public endpoint for parsing vehicle listing text.
 * Used by the simulator to extract vehicle specs from pasted text.
 * No authentication required (same parser as dashboard admin route).
 */
export async function POST(request: NextRequest) {
  let body: { text?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const text = (body.text || "").trim()
  if (text.length < 20) {
    return NextResponse.json({ error: "Cole o texto completo do anúncio (demasiado curto)." }, { status: 400 })
  }

  const parsed = await parseListingText(text)
  if (!parsed) {
    return NextResponse.json(
      { error: "Não foi possível interpretar o anúncio. Tente com a Entrada Manual." },
      { status: 422 },
    )
  }

  return NextResponse.json({ success: true, vehicle: parsed })
}
