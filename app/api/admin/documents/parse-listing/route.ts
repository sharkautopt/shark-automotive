import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseListingText } from "@/lib/ai/listing-parser"

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
      { error: "Não foi possível interpretar o anúncio. Preencha os campos manualmente." },
      { status: 422 },
    )
  }

  return NextResponse.json({ success: true, vehicle: parsed })
}
