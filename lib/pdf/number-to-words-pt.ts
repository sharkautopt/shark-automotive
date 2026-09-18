// Portuguese (pt-PT) integer-to-words, for the Contrato's "valor por extenso"
// clause. Covers 0–999,999,999 — comfortably past any realistic car price.

const UNITS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"]
const TEENS = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezasseis", "dezassete", "dezoito", "dezanove"]
const TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
const HUNDREDS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]

function under1000(n: number): string {
  if (n === 0) return ""
  if (n === 100) return "cem"
  const h = Math.floor(n / 100)
  const rest = n % 100
  const parts: string[] = []
  if (h > 0) parts.push(HUNDREDS[h])
  if (rest > 0) {
    if (rest < 10) parts.push(UNITS[rest])
    else if (rest < 20) parts.push(TEENS[rest - 10])
    else {
      const t = Math.floor(rest / 10)
      const u = rest % 10
      parts.push(u > 0 ? `${TENS[t]} e ${UNITS[u]}` : TENS[t])
    }
  }
  return parts.join(" e ")
}

/** e.g. 44530 -> "quarenta e quatro mil, quinhentos e trinta" */
function integerToWords(n: number): string {
  if (n === 0) return "zero"
  const millions = Math.floor(n / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1000)
  const rest = n % 1000

  const groups: string[] = []
  if (millions > 0) groups.push(millions === 1 ? "um milhão" : `${integerToWords(millions)} milhões`)
  if (thousands > 0) groups.push(thousands === 1 ? "mil" : `${under1000(thousands)} mil`)
  if (rest > 0) groups.push(under1000(rest))

  return groups.join(", ")
}

/** e.g. 44530 -> "quarenta e quatro mil, quinhentos e trinta euros" */
export function euroAmountInWords(amount: number): string {
  const rounded = Math.round(amount)
  const words = integerToWords(rounded)
  const suffix = rounded === 1 ? "euro" : "euros"
  // "um milhão de euros" / "dois milhões de euros" — "de" only applies when
  // the amount is a bare multiple of a million (no thousands/units below it).
  const isBareMillions = rounded >= 1_000_000 && rounded % 1_000_000 === 0
  return isBareMillions ? `${words} de ${suffix}` : `${words} ${suffix}`
}
