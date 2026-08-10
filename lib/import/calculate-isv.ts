/**
 * Calculate ISV (Imposto sobre Veículos) 2026 - Portuguese tax
 * Based on official 2026 tax tables from impostosobreveiculos.info
 * 
 * Formula: ISV = Componente Cilindrada + Componente Ambiental (CO2) + Taxa Partículas (if diesel)
 * For importados usados: applies age discount to cilindrada component only
 */

interface ISVResult {
  cilindrada: number
  ambiental: number
  particulas: number
  subtotal: number
  desconto: number
  total: number
}

export function calculateISV(
  fuelType: string | undefined,
  power: number | undefined, // Power in CV
  co2: number | undefined, // CO2 in g/km
  year: number | undefined,
  cc: number | undefined, // Engine displacement in cm3
  hasParticleFilter?: boolean
): number {
  const result = calculateISVDetailed(fuelType, power, co2, year, cc, hasParticleFilter)
  return result.total
}

export function calculateISVDetailed(
  fuelType: string | undefined,
  power: number | undefined,
  co2: number | undefined,
  year: number | undefined,
  cc: number | undefined,
  hasParticleFilter?: boolean
): ISVResult {
  // Normalize fuel type
  const fuel = (fuelType || "").toLowerCase()
  const emissions = co2 || 0
  const vehicleYear = year || new Date().getFullYear()
  const age = new Date().getFullYear() - vehicleYear

  let cilindrada = 0
  let ambiental = 0
  let particulas = 0

  // ===== COMPONENTE CILINDRADA =====
  // Only for light passenger vehicles (Table A)
  if (cc && cc > 0) {
    if (cc <= 1000) {
      cilindrada = cc * 1.09 - 849.03
    } else if (cc <= 1250) {
      cilindrada = cc * 1.18 - 850.69
    } else {
      cilindrada = cc * 5.61 - 6194.88
    }
  }

  // ===== COMPONENTE AMBIENTAL (CO2) =====
  if (emissions > 0) {
    if (fuel.includes("diesel") || fuel.includes("gasóleo")) {
      // Determine if NEDC or WLTP based on year
      // 2020+ = WLTP, 2017 and earlier = NEDC, 2018-2019 = mixed (assume WLTP for 2019+)
      const isWLTP = vehicleYear >= 2019

      if (isWLTP) {
        // DIESEL WLTP 2026
        if (emissions <= 110) {
          ambiental = emissions * 1.72 - 11.5
        } else if (emissions <= 120) {
          ambiental = emissions * 18.96 - 1906.19
        } else if (emissions <= 140) {
          ambiental = emissions * 65.04 - 7360.85
        } else if (emissions <= 150) {
          ambiental = emissions * 127.4 - 16080.57
        } else if (emissions <= 160) {
          ambiental = emissions * 160.81 - 21176.06
        } else if (emissions <= 170) {
          ambiental = emissions * 221.69 - 29227.38
        } else if (emissions <= 190) {
          ambiental = emissions * 274.08 - 36987.98
        } else {
          ambiental = emissions * 282.35 - 38271.32
        }
      } else {
        // DIESEL NEDC 2026
        if (emissions <= 79) {
          ambiental = emissions * 5.78 - 439.04
        } else if (emissions <= 95) {
          ambiental = emissions * 23.45 - 1848.58
        } else if (emissions <= 120) {
          ambiental = emissions * 79.22 - 7195.63
        } else if (emissions <= 140) {
          ambiental = emissions * 175.73 - 18924.92
        } else if (emissions <= 160) {
          ambiental = emissions * 195.43 - 21720.92
        } else {
          ambiental = emissions * 268.42 - 33447.9
        }
      }

      // Taxa de emissão de partículas (diesel only)
      // 500€ for diesel with particles or unknown filter status
      if (!hasParticleFilter) {
        particulas = 500
      }
    } else {
      // GASOLINA / GLP / GN (non-diesel)
      const isWLTP = vehicleYear >= 2019

      if (isWLTP) {
        // GASOLINA WLTP 2026
        if (emissions <= 110) {
          ambiental = emissions * 0.44 - 43.02
        } else if (emissions <= 115) {
          ambiental = emissions * 1.1 - 115.8
        } else if (emissions <= 120) {
          ambiental = emissions * 1.38 - 147.79
        } else if (emissions <= 130) {
          ambiental = emissions * 5.27 - 619.17
        } else if (emissions <= 145) {
          ambiental = emissions * 6.38 - 762.73
        } else if (emissions <= 175) {
          ambiental = emissions * 41.54 - 5819.56
        } else if (emissions <= 195) {
          ambiental = emissions * 51.38 - 7247.39
        } else if (emissions <= 235) {
          ambiental = emissions * 193.01 - 34190.52
        } else {
          ambiental = emissions * 233.81 - 41910.96
        }
      } else {
        // GASOLINA NEDC 2026
        if (emissions <= 99) {
          ambiental = emissions * 4.62 - 427
        } else if (emissions <= 115) {
          ambiental = emissions * 8.09 - 750.99
        } else if (emissions <= 145) {
          ambiental = emissions * 52.56 - 5903.94
        } else if (emissions <= 175) {
          ambiental = emissions * 61.24 - 7140.17
        } else if (emissions <= 195) {
          ambiental = emissions * 155.97 - 23627.27
        } else {
          ambiental = emissions * 205.65 - 33390.12
        }
      }
    }
  }

  let subtotal = Math.max(0, cilindrada + ambiental + particulas)

  // ===== DESCONTO POR IDADE (only applies to cilindrada component) =====
  // For imported used vehicles from EU
  let desconto = 0
  let descontoPercentage = 0

  if (age >= 1) {
    if (age <= 1) descontoPercentage = 0.1
    else if (age <= 2) descontoPercentage = 0.2
    else if (age <= 3) descontoPercentage = 0.28
    else if (age <= 4) descontoPercentage = 0.35
    else if (age <= 5) descontoPercentage = 0.43
    else if (age <= 6) descontoPercentage = 0.52
    else if (age <= 7) descontoPercentage = 0.6
    else if (age <= 8) descontoPercentage = 0.65
    else if (age <= 9) descontoPercentage = 0.7
    else if (age <= 10) descontoPercentage = 0.75
    else descontoPercentage = 0.8

    // Discount applies to cilindrada component only
    desconto = cilindrada * descontoPercentage
  }

  const total = Math.max(0, Math.round(subtotal - desconto))

  return {
    cilindrada: Math.round(cilindrada),
    ambiental: Math.round(ambiental),
    particulas: particulas,
    subtotal: Math.round(subtotal),
    desconto: Math.round(desconto),
    total: total,
  }
}
