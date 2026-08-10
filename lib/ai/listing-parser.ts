import { generateObject } from "ai"
import { z } from "zod"

/**
 * AI parser for pasted vehicle-listing text.
 *
 * The admin copy-pastes the raw text of a car page (auction house, mobile.de,
 * AutoScout24, a dealer site, etc.) — in any language — and this extracts a
 * clean, structured vehicle record with values normalized to European
 * Portuguese, ready to prefill the encomenda document form.
 *
 * Uses the Vercel AI Gateway (no provider SDK/key required) with an OpenAI
 * GPT-4o class model, matching the photo-analysis lib.
 *
 * Guarded: never throws. On failure returns a null result so the caller can
 * keep the form editable and the admin fills fields manually.
 */

const MODEL = "openai/gpt-4o-mini"

const parsedVehicleSchema = z.object({
  make: z.string().describe("Marca, ex: BMW, Audi, Mercedes-Benz"),
  model: z.string().describe("Modelo, ex: Série 3 Touring, A4 Avant"),
  variant: z.string().describe("Versão/acabamento se indicado, ex: 320d xDrive M Sport. Vazio se ausente."),
  year: z.string().describe("Ano da 1ª matrícula (4 dígitos). Vazio se ausente."),
  firstRegistration: z.string().describe("Data da 1ª matrícula no formato MM/AAAA. Vazio se ausente."),
  mileage: z.number().nullable().describe("Quilometragem em km, apenas número. null se ausente."),
  fuel: z.string().describe("Combustível em pt-PT: Gasolina, Diesel, Híbrido, Híbrido Plug-in, Elétrico, GPL."),
  power: z.number().nullable().describe("Potência em cavalos (cv). Converte de kW se necessário (kW×1,36). null se ausente."),
  displacement: z.number().nullable().describe("Cilindrada em cm³. null se ausente."),
  transmission: z.string().describe("Caixa em pt-PT: Manual ou Automática. Vazio se ausente."),
  drivetrain: z.string().describe("Tração em pt-PT: Dianteira, Traseira, Integral (4x4). Vazio se ausente."),
  doors: z.number().nullable().describe("Número de portas. null se ausente."),
  seats: z.number().nullable().describe("Número de lugares. null se ausente."),
  bodyType: z.string().describe("Carroçaria em pt-PT: Berlina, Carrinha, SUV, Coupé, Cabrio, Utilitário. Vazio se ausente."),
  exteriorColour: z.string().describe("Cor exterior em pt-PT. Vazio se ausente."),
  interior: z.string().describe("Estofos/interior em pt-PT, ex: Pele preta. Vazio se ausente."),
  co2: z.number().nullable().describe("Emissões de CO₂ em g/km. null se ausente."),
  vin: z.string().describe("Número de chassis (VIN) se indicado. Vazio se ausente."),
  owners: z.number().nullable().describe("Número de proprietários anteriores. null se ausente."),
  price: z.number().nullable().describe("Preço no anúncio em euros, apenas número. null se ausente."),
  features: z.array(z.string()).max(12).describe("Até 12 itens de equipamento relevantes, em pt-PT."),
  summary: z.string().max(320).describe("Resumo curto e comercial do veículo em português europeu (2-3 frases)."),
  sourceHint: z.string().describe("Origem do anúncio se detetável, ex: mobile.de, AutoScout24, leilão. Vazio se incerto."),
})

export type ParsedVehicle = z.infer<typeof parsedVehicleSchema>

/**
 * Parse pasted listing text into a structured vehicle record.
 * Returns null on failure (empty input, model error, etc.).
 */
export async function parseListingText(raw: string): Promise<ParsedVehicle | null> {
  const text = (raw || "").trim()
  if (text.length < 20) return null

  // Cap input to keep token usage bounded; listings rarely need more.
  const clipped = text.slice(0, 12000)

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: parsedVehicleSchema,
      system:
        "És um assistente de importação automóvel. Recebes o texto em bruto de um anúncio de um " +
        "automóvel (pode estar em alemão, inglês, francês, etc.) e extrais os dados técnicos de forma " +
        "estruturada. Normalizas todos os valores para português europeu e unidades europeias " +
        "(km, cv, cm³, g/km). Converte potência de kW para cv quando necessário. " +
        "Nunca inventes dados: se um campo não estiver presente, deixa-o vazio ou null. " +
        "O resumo deve ser objetivo e comercial, sem exageros.",
      messages: [
        {
          role: "user",
          content: `Texto do anúncio a analisar:\n\n${clipped}`,
        },
      ],
    })
    return object
  } catch (err) {
    console.log("[v0] Listing parse failed:", (err as Error).message)
    return null
  }
}
