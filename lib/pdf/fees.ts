/**
 * Shark import service-fee tiers.
 *
 * A single all-inclusive fee ("taxa de serviço") that covers transport,
 * insurance and every documental/notarial charge required to import and
 * legalize the vehicle. The fee is determined solely by the vehicle's
 * origin price:
 *
 *   ≤ 35.000 €           → 3.000 €
 *   35.001 – 60.000 €    → 4.500 €
 *   60.001 – 95.000 €    → 6.000 €
 *   > 95.000 €           → sob consulta (null)
 *
 * Total chave-na-mão = preço da viatura + ISV + taxa de serviço.
 */

export const SERVICE_FEE_INCLUDES =
  "Inclui transporte, seguro e todos os encargos documentais e notariais necessários."

export interface ServiceFeeTier {
  /** Fee in euros, or null when the price is above the published tiers. */
  fee: number | null
  /** Whether the price falls in the "sob consulta" band. */
  onRequest: boolean
  /** Human-readable price band for the tier, in pt-PT. */
  band: string
}

/**
 * Resolve the all-inclusive service fee for a given vehicle price.
 * Returns { fee: null, onRequest: true } for prices above 95.000 €.
 */
export function serviceFeeForPrice(price: number | null | undefined): ServiceFeeTier {
  const p = Number(price) || 0
  if (p <= 0) return { fee: null, onRequest: false, band: "—" }
  if (p <= 35000) return { fee: 3000, onRequest: false, band: "até 35.000 €" }
  if (p <= 60000) return { fee: 4500, onRequest: false, band: "35.001 – 60.000 €" }
  if (p <= 95000) return { fee: 6000, onRequest: false, band: "60.001 – 95.000 €" }
  return { fee: null, onRequest: true, band: "acima de 95.000 €" }
}
