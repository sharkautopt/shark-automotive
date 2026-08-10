import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import * as cheerio from "cheerio"

const MODEL = process.env.OPENAI_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini"

// List of user agents to rotate through
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
]

function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function fetchPageContent(url: string, attempt = 1): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": randomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8,pt;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
      signal: controller.signal,
      redirect: "follow",
    })

    if (!res.ok) {
      const statusCode = res.status
      if (statusCode === 403 && attempt < 2) {
        // Try once more with different headers
        clearTimeout(timeout)
        return fetchPageContent(url, attempt + 1)
      }
      if (statusCode === 403) {
        throw new Error(`O site recusou o acesso (403). O site tem protecção contra acesso automatizado.`)
      }
      if (statusCode === 429) {
        throw new Error(`O site está a limitar requisições. Tente novamente daqui a alguns minutos.`)
      }
      throw new Error(`HTTP ${statusCode}: ${res.statusText}`)
    }

    return await res.text()
  } catch (e) {
    clearTimeout(timeout)
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(`O site demorou demasiado tempo a responder (>15s).`)
    }
    throw e
  }
}

function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html)

  // Remove script and style elements
  $("script, style, noscript, meta, link").remove()

  // Get text from common car listing sections
  const sections = [
    $("h1").text(), // Title usually has make/model
    $("h2").text(),
    $("[data-testid*='title'], [data-testid*='heading']").text(),
    $(".ad-title, .listing-title, [class*='title']").text().slice(0, 500),
    $(".ad-details, .details, [class*='details']").text().slice(0, 2000),
    $(".specifications, .specs, [class*='spec']").text().slice(0, 2000),
    $.root().text().slice(0, 5000), // Fallback to all text
  ].filter((text) => text.length > 0)

  return sections.join(" | ")
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL é obrigatório" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "URL inválido" }, { status: 400 })
    }

    // Fetch page content
    let html: string
    try {
      html = await fetchPageContent(url)
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao aceder ao site" }, { status: 400 })
    }

    // Extract relevant text from HTML using cheerio
    const extractedText = extractTextFromHtml(html)

    if (extractedText.length < 50) {
      return NextResponse.json({ error: "Não consegui encontrar dados de carro neste site" }, { status: 400 })
    }

    // Use AI to parse vehicle data from extracted text
    const { text: jsonResponse } = await generateText({
      model: MODEL,
      system: `Você é um especialista em análise de anúncios de automóveis. Extrai dados técnicos precisos.
Retorna APENAS um JSON válido (sem markdown, sem explicações).
Se um campo não estiver disponível, use null.
Normaliza: potência em cv, volume em cm³, consumo em g/km, distância em km.`,
      prompt: `Extrai dados deste anúncio de carro:

${extractedText.slice(0, 3000)}

Retorna JSON (sem markdown):
{"make":"marca","model":"modelo","year":null,"mileage":null,"price":null,"fuelType":null,"power":null,"transmission":null,"bodyType":null,"co2":null}`,
      temperature: 0.3,
    })

    // Parse JSON response
    let data
    try {
      // Clean up response (remove markdown if present)
      const cleaned = jsonResponse.replace(/```json\n?|\n?```/g, "").trim()
      data = JSON.parse(cleaned)
    } catch (e) {
      console.error("[v0] Failed to parse JSON:", jsonResponse)
      return NextResponse.json({ error: "Erro ao processar dados do site" }, { status: 400 })
    }

    // Validate that we got at least some data
    if (!data.make && !data.model && !data.price) {
      return NextResponse.json(
        { error: "Não consegui extrair dados de carro deste site. Tente usar a entrada manual." },
        { status: 400 },
      )
    }

    data.url = url
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] parse-url error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
