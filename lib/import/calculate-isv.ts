/**
 * Calculate ISV (Imposto sobre Veículos) — Portugal 2026 tax tables.
 *
 * Formula: ISV = Componente Cilindrada (com desconto) + Componente Ambiental (com desconto) + Taxa Partículas
 *
 * Both the cilindrada and ambiental components receive the age discount (per Código do ISV, art. 11º,
 * for used vehicles imported from another EU member state). The particle-emissions surcharge (500 €) only
 * applies to diesel vehicles and only when the user explicitly confirms particulate emissions ≥0,001 g/km —
 * it must never be assumed.
 *
 * The "Norma de homologação" (NEDC vs WLTP) determines which Componente Ambiental table applies and MUST be
 * an explicit user selection — it is never inferred from the registration year. Vehicles registered around
 * 2018–2019 can be homologated under either standard, and guessing wrong changes the result by hundreds of
 * euros. Consult the vehicle's Certificado de Conformidade (CoC) or DUA.
 *
 * All tables below are plain data so next year's rates can be swapped in without touching the formula logic.
 */

export type Norma = "NEDC" | "WLTP"
export type FuelCategory = "gasolina" | "gasoleo"

interface Bracket {
  max: number
  taxa: number
  abater: number
}

/** Componente Cilindrada — same table regardless of fuel type or norma. */
const CILINDRADA_TABLE: Bracket[] = [
  { max: 1000, taxa: 1.09, abater: 849.03 },
  { max: 1250, taxa: 1.18, abater: 850.69 },
  { max: Infinity, taxa: 5.61, abater: 6194.88 },
]

/** Componente Ambiental — Gasolina / GPL / GN, homologação NEDC. */
const AMBIENTAL_GASOLINA_NEDC: Bracket[] = [
  { max: 99, taxa: 4.62, abater: 427.0 },
  { max: 115, taxa: 8.09, abater: 750.99 },
  { max: 145, taxa: 52.56, abater: 5903.94 },
  { max: 175, taxa: 61.24, abater: 7140.17 },
  { max: 195, taxa: 155.97, abater: 23627.27 },
  { max: Infinity, taxa: 205.65, abater: 33390.12 },
]

/** Componente Ambiental — Gasolina / GPL / GN, homologação WLTP. */
const AMBIENTAL_GASOLINA_WLTP: Bracket[] = [
  { max: 110, taxa: 0.44, abater: 43.02 },
  { max: 115, taxa: 1.1, abater: 115.8 },
  { max: 120, taxa: 1.38, abater: 147.79 },
  { max: 130, taxa: 5.27, abater: 619.17 },
  { max: 145, taxa: 6.38, abater: 762.73 },
  { max: 175, taxa: 41.54, abater: 5819.56 },
  { max: 195, taxa: 51.38, abater: 7247.39 },
  { max: 235, taxa: 193.01, abater: 34190.52 },
  { max: Infinity, taxa: 233.81, abater: 41910.96 },
]

/** Componente Ambiental — Gasóleo, homologação NEDC. */
const AMBIENTAL_GASOLEO_NEDC: Bracket[] = [
  { max: 79, taxa: 5.78, abater: 439.04 },
  { max: 95, taxa: 23.45, abater: 1848.58 },
  { max: 120, taxa: 79.22, abater: 7195.63 },
  { max: 140, taxa: 175.73, abater: 18924.92 },
  { max: 160, taxa: 195.43, abater: 21720.92 },
  { max: Infinity, taxa: 268.42, abater: 33447.9 },
]

/** Componente Ambiental — Gasóleo, homologação WLTP. */
const AMBIENTAL_GASOLEO_WLTP: Bracket[] = [
  { max: 110, taxa: 1.72, abater: 11.5 },
  { max: 120, taxa: 18.96, abater: 1906.19 },
  { max: 140, taxa: 65.04, abater: 7360.85 },
  { max: 150, taxa: 127.4, abater: 16080.57 },
  { max: 160, taxa: 160.81, abater: 21176.06 },
  { max: 170, taxa: 221.69, abater: 29227.38 },
  { max: 190, taxa: 274.08, abater: 36987.98 },
  { max: Infinity, taxa: 282.35, abater: 38271.32 },
]

/** Desconto por idade (importados usados, UE) — applies to both cilindrada and ambiental components. */
const AGE_DISCOUNT_TABLE: { maxYears: number; discount: number }[] = [
  { maxYears: 1, discount: 0.1 },
  { maxYears: 2, discount: 0.2 },
  { maxYears: 3, discount: 0.28 },
  { maxYears: 4, discount: 0.35 },
  { maxYears: 5, discount: 0.43 },
  { maxYears: 6, discount: 0.52 },
  { maxYears: 7, discount: 0.6 },
  { maxYears: 8, discount: 0.65 },
  { maxYears: 9, discount: 0.7 },
  { maxYears: 10, discount: 0.75 },
  { maxYears: Infinity, discount: 0.8 },
]

/** Surcharge for diesel vehicles with confirmed particulate emissions ≥0,001 g/km. */
const PARTICULATE_SURCHARGE = 500

const round2 = (n: number) => Math.round(n * 100) / 100

function applyBracketTable(value: number, table: Bracket[]): number {
  const bracket = table.find((b) => value <= b.max) ?? table[table.length - 1]
  return value * bracket.taxa - bracket.abater
}

function ageDiscountFor(ageYears: number): number {
  const bracket = AGE_DISCOUNT_TABLE.find((b) => ageYears <= b.maxYears) ?? AGE_DISCOUNT_TABLE[AGE_DISCOUNT_TABLE.length - 1]
  return bracket.discount
}

/** Maps loosely-typed fuel strings (free text, AI-parsed listings) to the two ISV fuel categories. */
export function normalizeFuelCategory(fuelType: string | undefined): FuelCategory {
  const fuel = (fuelType || "").toLowerCase()
  if (fuel.includes("dies") || fuel.includes("gasóleo") || fuel.includes("gasoleo")) return "gasoleo"
  return "gasolina"
}

export interface ISVParams {
  /** Gasolina/GPL/GN or Gasóleo — drives which Componente Ambiental table is used. */
  fuel: FuelCategory
  /** Engine displacement in cm³. */
  cc: number | undefined
  /** CO2 emissions in g/km. */
  co2: number | undefined
  /**
   * Homologation standard (NEDC or WLTP). REQUIRED — must be an explicit user selection.
   * Never auto-inferred from registration year: 2018–2019 vehicles can be either, and guessing
   * wrong changes the result by hundreds of euros.
   */
  norma: Norma
  /** Registration year (1st matrícula). */
  registrationYear: number | undefined
  /** Registration month, 1-12. Defaults to 6 (mid-year) when unknown — affects the age-discount bracket. */
  registrationMonth?: number
  /**
   * User-confirmed particulate emissions ≥0,001 g/km (diesel only). Defaults to false — most cars
   * don't trigger this, and defaulting it on would overstate the estimate.
   */
  particulatesConfirmed?: boolean
  /** Reference date for the age calculation. Defaults to now — exposed for testing. */
  asOf?: Date
}

export interface ISVBreakdown {
  /** Componente Cilindrada before the age discount. */
  cilindradaBruta: number
  /** Componente Cilindrada after the age discount. */
  cilindradaFinal: number
  /** Componente Ambiental before the age discount (floored at 0). */
  ambientalBruta: number
  /** Componente Ambiental after the age discount. */
  ambientalFinal: number
  /** Age of the vehicle in years (continuous, e.g. 6.08), used to pick the discount bracket. */
  ageYears: number
  /** Age discount percentage applied (e.g. 0.6 = 60%). */
  descontoPercentagem: number
  /** Particle-emissions surcharge (500 € or 0). */
  particulas: number
  /** Final ISV total. */
  total: number
}

export function calculateISVDetailed(params: ISVParams): ISVBreakdown {
  const { fuel, cc, co2, norma, registrationYear, registrationMonth, particulatesConfirmed, asOf } = params

  // ===== COMPONENTE CILINDRADA =====
  const cilindradaBruta = cc && cc > 0 ? applyBracketTable(cc, CILINDRADA_TABLE) : 0

  // ===== COMPONENTE AMBIENTAL =====
  let ambientalBruta = 0
  if (co2 && co2 > 0) {
    const table =
      fuel === "gasoleo"
        ? norma === "WLTP"
          ? AMBIENTAL_GASOLEO_WLTP
          : AMBIENTAL_GASOLEO_NEDC
        : norma === "WLTP"
          ? AMBIENTAL_GASOLINA_WLTP
          : AMBIENTAL_GASOLINA_NEDC
    ambientalBruta = Math.max(0, applyBracketTable(co2, table))
  }

  // ===== IDADE (anos completos, calculados por meses inteiros desde a 1ª matrícula) =====
  const now = asOf ?? new Date()
  let ageYears = 0
  if (registrationYear) {
    const regMonth = registrationMonth && registrationMonth >= 1 && registrationMonth <= 12 ? registrationMonth : 6
    // Day-of-registration isn't collected (only month/year), so age is computed in whole calendar months.
    const monthsElapsed = (now.getFullYear() - registrationYear) * 12 + (now.getMonth() + 1 - regMonth)
    ageYears = Math.max(0, monthsElapsed / 12)
  }
  const descontoPercentagem = ageYears > 0 ? ageDiscountFor(ageYears) : 0

  const cilindradaFinal = cilindradaBruta * (1 - descontoPercentagem)
  const ambientalFinal = ambientalBruta * (1 - descontoPercentagem)

  // ===== TAXA DE EMISSÃO DE PARTÍCULAS (gasóleo, apenas se confirmado pelo utilizador) =====
  const particulas = fuel === "gasoleo" && particulatesConfirmed ? PARTICULATE_SURCHARGE : 0

  const total = Math.max(0, round2(cilindradaFinal) + round2(ambientalFinal) + particulas)

  return {
    cilindradaBruta: round2(cilindradaBruta),
    cilindradaFinal: round2(cilindradaFinal),
    ambientalBruta: round2(ambientalBruta),
    ambientalFinal: round2(ambientalFinal),
    ageYears: round2(ageYears),
    descontoPercentagem,
    particulas,
    total: round2(total),
  }
}

export function calculateISV(params: ISVParams): number {
  return calculateISVDetailed(params).total
}
