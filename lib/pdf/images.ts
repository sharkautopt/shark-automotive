import sharp from "sharp"

/**
 * react-pdf cannot render WebP/AVIF and its internal remote-URL fetching is
 * unreliable (silent intermittent failures). To guarantee photos always render,
 * we fetch each image server-side, convert it to JPEG, and embed it as a data URI.
 */

const FETCH_TIMEOUT_MS = 10000
/** Max width for embedded photos — keeps PDFs small while staying sharp in print. */
const MAX_WIDTH = 1200

/**
 * Fetch a remote image and return it as a JPEG data URI, or null on failure.
 * Data URIs / already-embedded images pass through untouched.
 */
export async function resolvePdfImage(url: string | null | undefined): Promise<string | null> {
  if (!url) return null
  if (url.startsWith("data:")) return url

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) {
      console.log("[v0] PDF image fetch failed:", res.status, url.slice(0, 120))
      return null
    }
    const input = Buffer.from(await res.arrayBuffer())
    if (input.length === 0) return null

    // Normalize everything (webp, avif, png, rotated jpegs...) to a flat JPEG.
    const jpeg = await sharp(input)
      .rotate() // respect EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 80 })
      .toBuffer()

    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch (err) {
    console.log("[v0] PDF image resolve failed:", (err as Error).message, url.slice(0, 120))
    return null
  }
}

/**
 * Resolve a list of image URLs in parallel, dropping any that fail so the
 * PDF always renders with whatever photos are available.
 */
export async function resolvePdfImages(urls: (string | null | undefined)[]): Promise<string[]> {
  const resolved = await Promise.all(urls.map((u) => resolvePdfImage(u)))
  return resolved.filter((r): r is string => r !== null)
}
