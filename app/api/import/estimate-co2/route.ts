import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const MODEL = process.env.OPENAI_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini"

function parseJson(text: string) {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
  return JSON.parse(cleaned) as { co2?: unknown; norma?: unknown; confidence?: unknown }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const make = typeof body.make === "string" ? body.make.trim() : ""
    const model = typeof body.model === "string" ? body.model.trim() : ""
    const year = Number(body.year)
    const cc = Number(body.cc)
    const fuelType = typeof body.fuelType === "string" ? body.fuelType.trim() : ""

    if (!make || !model || !year || !cc || !fuelType) {
      return NextResponse.json({ error: "Dados insuficientes para estimar CO₂." }, { status: 400 })
    }

    const { text } = await generateText({
      model: MODEL,
      system: "You are a vehicle homologation data specialist. Return only valid JSON. Never invent a value when the vehicle specification is ambiguous.",
      prompt: `What is the official CO2 emissions figure (g/km) for a ${year} ${make} ${model} with a ${cc}cc ${fuelType} engine? Also state whether this figure is NEDC or WLTP homologation. Respond only with JSON: { "co2": number, "norma": "NEDC" | "WLTP", "confidence": "high" | "low" }. Return confidence low if there are multiple plausible engine variants or the figure cannot be verified.`,
      temperature: 0,
    })

    const result = parseJson(text)
    const co2 = typeof result.co2 === "number" && Number.isFinite(result.co2) && result.co2 > 0 ? result.co2 : null
    const norma = result.norma === "NEDC" || result.norma === "WLTP" ? result.norma : null
    const confidence = result.confidence === "high" || result.confidence === "low" ? result.confidence : "low"

    if (co2 === null || norma === null || confidence !== "high") {
      return NextResponse.json({ co2: null, norma: null, confidence: "low" })
    }

    return NextResponse.json({ co2, norma, confidence: "high" })
  } catch (error) {
    console.error("[v0] CO2 estimate failed:", error)
    return NextResponse.json({ co2: null, norma: null, confidence: "low" }, { status: 200 })
  }
}
