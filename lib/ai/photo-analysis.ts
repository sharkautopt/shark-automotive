import { generateObject } from "ai"
import { z } from "zod"

/**
 * AI photo analysis for vehicle listings.
 *
 * Scores each uploaded photo on how suitable it is as a listing image and
 * proposes an ordering with the strongest "hero" shot first. Uses the Vercel
 * AI Gateway (no provider SDK/key required) with an OpenAI GPT-4o class model.
 *
 * Guarded by design: if analysis fails for any reason, callers fall back to
 * the manual upload order, so the feature can never block publishing.
 */

const MODEL = "google/gemini-2.5-flash"

function getImageMediaType(url: string): string {
  const cleanUrl = url.split("?")[0].toLowerCase()
  if (cleanUrl.endsWith(".png")) return "image/png"
  if (cleanUrl.endsWith(".webp")) return "image/webp"
  if (cleanUrl.endsWith(".gif")) return "image/gif"
  return "image/jpeg"
}

const photoScoreSchema = z.object({
  index: z.number().int().describe("The 0-based index of the photo in the input list"),
  category: z
    .enum(["exterior_front", "exterior_rear", "exterior_side", "interior", "engine", "detail", "document", "other"])
    .describe("What the photo primarily shows"),
  score: z.number().min(0).max(100).describe("Overall suitability as a listing photo, 0-100"),
  isHeroCandidate: z.boolean().describe("Whether this is a strong candidate for the main/hero image"),
  quality: z.enum(["excellent", "good", "fair", "poor"]).describe("Technical image quality"),
  notes: z.string().max(160).describe("Short reason for the score, in European Portuguese"),
})

const analysisSchema = z.object({
  scores: z.array(photoScoreSchema),
})

export type PhotoScore = z.infer<typeof photoScoreSchema>

export interface PhotoAnalysisResult {
  orderedPhotos: string[]
  heroPhoto: string | null
  scores: Array<PhotoScore & { url: string }>
  model: string
}

/**
 * Analyze and rank vehicle photos. Returns an ordering (hero first) plus
 * per-photo scores. Never throws — on failure returns the original order with
 * a null hero and empty scores so the caller can fall back gracefully.
 */
export async function analyzeVehiclePhotos(
  photoUrls: string[],
  vehicleLabel: string,
): Promise<PhotoAnalysisResult> {
  const fallback: PhotoAnalysisResult = {
    orderedPhotos: photoUrls,
    heroPhoto: photoUrls[0] ?? null,
    scores: [],
    model: MODEL,
  }

  if (photoUrls.length === 0) return fallback

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: analysisSchema,
      system:
        "És um especialista em fotografia automóvel para anúncios de venda premium. " +
        "Avalias fotografias de veículos e escolhes as melhores para um anúncio. " +
        "Uma boa foto principal (hero) mostra o exterior do carro completo, de três quartos frontal, " +
        "bem iluminado, enquadrado e nítido. Penalizas fotos tremidas, escuras, cortadas, " +
        "de documentos, ou irrelevantes. Respondes sempre em português europeu.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Veículo: ${vehicleLabel}. Avalia cada uma das ${photoUrls.length} fotografias seguintes ` +
                `pela ordem apresentada (índice 0 a ${photoUrls.length - 1}). ` +
                `IMPORTANTE: documentos, folhas de manutenção, histórico de serviço, faturas, matrículas ` +
                `e screenshots são sempre category=document, score máximo 5 e isHeroCandidate=false. ` +
                `A capa só pode ser uma fotografia exterior do carro completo: exterior_front, ` +
                `exterior_rear ou exterior_side. Fotos de interior, motor, detalhes e documentos nunca ` +
                `podem ser capa. Para cada foto indica a categoria, pontuação 0-100, se é candidata ` +
                `a foto principal, qualidade técnica e uma nota curta. Devolve uma entrada por foto.`,
            },
            ...photoUrls.map((url) => ({
              type: "file" as const,
              data: new URL(url),
              mediaType: getImageMediaType(url),
            })),
          ],
        },
      ],
    })

    const scoresByIndex = new Map(object.scores.map((s) => [s.index, s]))

    // Build score list aligned to URLs, defaulting missing entries to a neutral score.
    const enriched = photoUrls.map((url, i) => {
      const s = scoresByIndex.get(i)
      return {
        url,
        index: i,
        category: s?.category ?? ("other" as const),
        score: s?.score ?? 50,
        isHeroCandidate: s?.isHeroCandidate ?? false,
        quality: s?.quality ?? ("fair" as const),
        notes: s?.notes ?? "",
      }
    })

    // Documents and service-history photos can score highly for legibility, but must
    // never become the listing cover. Apply a deterministic vehicle-photo priority
    // after the model response so the result remains safe and predictable.
    const exteriorCategories = new Set([
      "exterior_front",
      "exterior_rear",
      "exterior_side",
    ])
    const isExterior = (photo: (typeof enriched)[number]) =>
      exteriorCategories.has(photo.category)

    const normalized = enriched.map((photo) => ({
      ...photo,
      score: photo.category === "document" ? 0 : photo.score,
      isHeroCandidate: photo.category === "document" ? false : photo.isHeroCandidate,
    }))

    const ordered = [...normalized].sort((a, b) => {
      const aExterior = isExterior(a) ? 1 : 0
      const bExterior = isExterior(b) ? 1 : 0
      return bExterior - aExterior || b.score - a.score || a.index - b.index
    })

    const heroPool = normalized.filter(isExterior)
    const hero = [...heroPool].sort((a, b) => {
      const aCandidate = a.isHeroCandidate ? 1 : 0
      const bCandidate = b.isHeroCandidate ? 1 : 0
      return bCandidate - aCandidate || b.score - a.score || a.index - b.index
    })[0]
    const fallbackHero = normalized.find((photo) => photo.category !== "document")

    return {
      orderedPhotos: ordered.map((s) => s.url),
      heroPhoto: hero?.url ?? fallbackHero?.url ?? null,
      scores: normalized,
      model: MODEL,
    }
  } catch (err) {
    console.log("[v0] Photo analysis failed, falling back to upload order:", (err as Error).message)
    return fallback
  }
}
