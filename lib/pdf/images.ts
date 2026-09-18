import Vips from "wasm-vips"

/**
 * react-pdf cannot render WebP/AVIF and its internal remote-URL fetching is
 * unreliable (silent intermittent failures). To guarantee photos always render,
 * we fetch each image server-side, convert it to JPEG, and embed it as a data URI.
 *
 * Uses wasm-vips (libvips compiled to WebAssembly) rather than sharp: sharp's
 * native .node/libvips binary repeatedly failed to load in Vercel's linux-x64
 * serverless runtime (ERR_DLOPEN_FAILED on libvips-cpp.so) even after fixing
 * the pnpm hoisting layout and forcing a cache-cleared rebuild. WASM has no
 * platform binary to dlopen, so it sidesteps that whole class of failure.
 */

const FETCH_TIMEOUT_MS = 4000
const BATCH_TIMEOUT_MS = 12000
/** Max width for embedded photos — keeps PDFs small while staying sharp in print. */
const MAX_WIDTH = 1200

let vipsPromise: ReturnType<typeof Vips> | null = null
function getVips() {
  if (!vipsPromise) vipsPromise = Vips()
  return vipsPromise
}

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
    const vips = await getVips()
    let image = vips.Image.newFromBuffer(input).autorot()
    if (image.width > MAX_WIDTH) {
      image = image.resize(MAX_WIDTH / image.width)
    }
    if (image.hasAlpha()) {
      image = image.flatten({ background: [255, 255, 255] })
    }
    const jpeg = Buffer.from(image.writeToBuffer(".jpg", { Q: 80 }))

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
  const resolved = await Promise.race([
    Promise.all(urls.map((u) => resolvePdfImage(u))),
    new Promise<(string | null)[]>((resolve) => setTimeout(() => resolve([]), BATCH_TIMEOUT_MS)),
  ])
  return resolved.filter((r): r is string => r !== null)
}
