import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import type { SupabaseClient } from "@supabase/supabase-js"
import { registerPdfFonts } from "@/lib/pdf/theme"
import { generateQrDataUrl } from "@/lib/pdf/helpers"
import { resolvePdfImage, resolvePdfImages } from "@/lib/pdf/images"
import { COMPANY } from "@/lib/pdf/company"
import { WindowStickerDocument } from "@/components/pdf/window-sticker"
import type { Vehicle } from "@/lib/types"

export interface BuiltSticker {
  buffer: Buffer
  vehicle: Vehicle
  heroPhoto: string | null
  filename: string
}

/**
 * Builds the window-sticker PDF for a vehicle. Shared by the admin generation
 * route (which also uploads + records it) and the public download route
 * (which streams it on the fly). Returns null if the vehicle is not found.
 */
export async function buildWindowSticker(
  supabase: SupabaseClient,
  vehicleId: string,
  origin: string,
): Promise<BuiltSticker | null> {
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single<Vehicle>()

  if (error || !vehicle) return null

  // Prefer AI analysis hero + ordering, else fall back to upload order.
  const { data: analysis } = await supabase
    .from("vehicle_photo_analysis")
    .select("hero_photo_url, ordered_photos")
    .eq("vehicle_id", vehicle.id)
    .maybeSingle()

  const ordered: string[] =
    Array.isArray(analysis?.ordered_photos) && analysis.ordered_photos.length > 0
      ? (analysis.ordered_photos as string[])
      : vehicle.photos || []

  const heroUrl = analysis?.hero_photo_url || ordered[0] || vehicle.photos?.[0] || null
  const thumbnailUrls = ordered.filter((p) => p !== heroUrl).slice(0, 5)
  const registo = `#${vehicle.id.slice(0, 6).toUpperCase()}`

  const listingUrl = `${origin || COMPANY.siteUrl}/inventario/${vehicle.id}`

  // Pre-fetch photos server-side and embed as JPEG data URIs — react-pdf's own
  // remote fetching is unreliable and it cannot decode WebP/AVIF uploads.
  const [qrDataUrl, heroPhoto, thumbnails] = await Promise.all([
    generateQrDataUrl(listingUrl),
    resolvePdfImage(heroUrl),
    resolvePdfImages(thumbnailUrls),
  ])

  registerPdfFonts()
  const buffer = await renderToBuffer(
    createElement(WindowStickerDocument, { vehicle, heroPhoto, thumbnails, qrDataUrl, registo }),
  )

  const safeName = `${vehicle.make}-${vehicle.model}-${vehicle.year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  // Return the original URL (not the embedded data URI) so callers can persist it.
  return { buffer, vehicle, heroPhoto: heroUrl, filename: `ficha-${safeName}.pdf` }
}
