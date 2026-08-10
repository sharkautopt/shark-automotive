import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeVehiclePhotos } from "@/lib/ai/photo-analysis"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// POST /api/admin/photo-analysis  -> analyze a vehicle's photos and persist the result
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let body: { vehicleId?: string; photos?: string[]; label?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const { vehicleId, photos, label } = body
  if (!vehicleId || !Array.isArray(photos) || photos.length === 0) {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 })
  }

  const result = await analyzeVehiclePhotos(photos, label || "Veículo")

  // Persist analysis (upsert one row per vehicle)
  const { error } = await supabase
    .from("vehicle_photo_analysis")
    .upsert(
      {
        vehicle_id: vehicleId,
        hero_photo_url: result.heroPhoto,
        ordered_photos: result.orderedPhotos,
        scores: result.scores,
        model: result.model,
        analyzed_at: new Date().toISOString(),
      },
      { onConflict: "vehicle_id" },
    )

  if (error) {
    console.log("[v0] Failed to persist photo analysis:", error.message)
    return NextResponse.json({ error: "Erro ao guardar análise" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    heroPhoto: result.heroPhoto,
    orderedPhotos: result.orderedPhotos,
    scores: result.scores,
    analyzed: result.scores.length > 0,
  })
}
