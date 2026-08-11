import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import * as cheerio from "cheerio"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 45

const MODEL = "openai/gpt-4o-mini"

type SearchResult = { title: string; url: string; snippet: string }
type Estimate = { co2?: unknown; norma?: unknown; source?: unknown; confidence?: unknown }

function parseJson(text: string): Estimate {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
  return JSON.parse(cleaned) as Estimate
}

async function searchWeb(query: string): Promise<SearchResult[]> {
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SharkAutomotive/1.0)" },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`Pesquisa web HTTP ${response.status}`)

  const $ = cheerio.load(await response.text())
  return $(".result").toArray().slice(0, 8).map((element) => {
    const result = $(element)
    const href = result.find(".result__a").attr("href") || ""
    const url = href.startsWith("//") ? `https:${href}` : href
    return {
      title: result.find(".result__a").text().trim(),
      url,
      snippet: result.find(".result__snippet").text().trim(),
    }
  }).filter((result) => result.title && result.url)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const make = typeof body.make === "string" ? body.make.trim() : ""
    const model = typeof body.model === "string" ? body.model.trim() : ""
    const variant = typeof body.variant === "string" ? body.variant.trim() : ""
    const year = Number(body.year)
    const cc = Number(body.cc)
    const power = Number(body.power)
    const fuelType = typeof body.fuelType === "string" ? body.fuelType.trim() : ""
    const transmission = typeof body.transmission === "string" ? body.transmission.trim() : ""

    if (!make || !model || !year || !cc || !fuelType) {
      return NextResponse.json({ co2: null, norma: null, confidence: "low" })
    }

    const query = `official homologated CO2 g/km ${year} ${make} ${model} ${variant} ${power || ""}cv ${cc}cc ${fuelType} ${transmission} NEDC WLTP`
    const results = await searchWeb(query)
    if (!results.length) return NextResponse.json({ co2: null, norma: null, confidence: "low" })

    const { text } = await generateText({
      model: MODEL,
      system: "You are a vehicle homologation researcher. Use only the supplied web search results. Never guess or use memory. Return only valid JSON.",
      prompt: `Find the exact official homologated CO2 figure for this specific vehicle: ${year} ${make} ${model} ${variant}, ${power || "unknown"}cv, ${cc}cc, ${fuelType}, ${transmission || "unknown"}.

Search results:
${results.map((result, index) => `${index + 1}. ${result.title}\nURL: ${result.url}\n${result.snippet}`).join("\n\n")}

Prefer manufacturer technical data, official press kits, ADAC, Spritmonitor, or another reputable automotive database. Match the exact engine/trim where possible. Respond only with JSON: { "co2": number | null, "norma": "NEDC" | "WLTP" | null, "source": string | null, "confidence": "high" | "low" }. Return low confidence if the result is for a different engine, trim, year, or if no reliable source supports the exact figure. Never infer a number from a range.`,
      temperature: 0,
    })

    const result = parseJson(text)
    const co2 = typeof result.co2 === "number" && Number.isFinite(result.co2) && result.co2 > 0 ? result.co2 : null
    const norma = result.norma === "NEDC" || result.norma === "WLTP" ? result.norma : null
    const source = typeof result.source === "string" && result.source.trim() ? result.source.trim() : null
    const confidence = result.confidence === "high" ? "high" : "low"

    if (!co2 || !norma || !source || confidence !== "high") {
      return NextResponse.json({ co2: null, norma: null, source: null, confidence: "low" })
    }

    return NextResponse.json({ co2, norma, source, confidence: "high" })
  } catch (error) {
    console.error("[v0] CO2 web search failed:", error)
    return NextResponse.json({ co2: null, norma: null, source: null, confidence: "low" }, { status: 200 })
  }
}
