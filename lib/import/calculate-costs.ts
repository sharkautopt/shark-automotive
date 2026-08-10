import { serviceFeeForPrice } from "@/lib/pdf/fees"

export interface ImportCosts {
  vehiclePrice: number
  isv: number
  serviceFee: number
  transportInsurance: number
  legalDocumentation: number
  subtotal: number
  total: number
  breakdown: {
    label: string
    value: number
    note?: string
  }[]
}

const FIXED_COSTS = {
  documentation: 200, // registration, notary, etc. (transport & insurance included in service fee)
}

export function calculateImportCosts(
  vehiclePrice: number,
  isv: number = 0,
  hasServiceFee: boolean = true,
): ImportCosts {
  const feeTier = hasServiceFee ? serviceFeeForPrice(vehiclePrice) : { fee: 0, onRequest: false, band: "" }
  const serviceFee = feeTier.fee || 0
  const transportInsurance = 0 // Included in service fee
  const legalDocumentation = FIXED_COSTS.documentation

  const subtotal = vehiclePrice + isv + serviceFee + legalDocumentation
  const total = subtotal

  const breakdown = [
    { label: "Preço do veículo", value: vehiclePrice },
    { label: "ISV (Imposto sobre Veículos)", value: isv, note: isv > 0 ? "Estimado" : "Verificar com autoridades" },
    ...(serviceFee > 0 ? [{ label: "Taxa de serviço Shark", value: serviceFee, note: "Inclui transporte, seguro e encargos documentais e notariais" }] : []),
    ...(feeTier.onRequest ? [{ label: "Taxa de serviço Shark", value: 0, note: "Acima de 95.000 € - sob consulta" }] : []),
  ].filter((item) => item.value > 0 || item.label === "ISV (Imposto sobre Veículos)" || item.note?.includes("sob consulta"))

  return {
    vehiclePrice,
    isv,
    serviceFee,
    transportInsurance,
    legalDocumentation,
    subtotal,
    total,
    breakdown,
  }
}
