/**
 * react-pdf's own remote-URL fetching is unreliable (silent intermittent
 * failures) and it cannot decode WebP/AVIF. To guarantee photos always
 * render, we fetch each image server-side and embed the original bytes as a
 * data URI — no native image processing (e.g. sharp/libvips) involved, so
 * this has no native binary to load in serverless runtimes.
 *
 * Note: this intentionally skips resizing/re-encoding. Photos should already
 * be reasonably sized JPEGs/PNGs at upload time; WebP/AVIF sources will still
 * fail to render inside the PDF (react-pdf limitation) and are dropped.
 */

const FETCH_TIMEOUT_MS = 10000
const SUPPORTED_CONTENT_TYPES = ["image/jpeg", "image/jpg", "image/png"]

/**
 * Fetch a remote image and return it as a data URI, or null on failure.
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

    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || ""
    if (!SUPPORTED_CONTENT_TYPES.includes(contentType)) {
      console.log("[v0] PDF image skipped (unsupported type without sharp):", contentType, url.slice(0, 120))
      return null
    }

    const input = Buffer.from(await res.arrayBuffer())
    if (input.length === 0) return null

    return `data:${contentType};base64,${input.toString("base64")}`
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
