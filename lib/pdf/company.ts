/**
 * Single source of truth for company identity and locked legal text used in
 * generated documents. Mirrors the site footer / contact page.
 */
export const COMPANY = {
  brand: "SHARK AUTOMOTIVE",
  legalName: "ESTIRPESÓBRIA – SOCIEDADE UNIPESSOAL LDA",
  address: "Avenida Luís Bívar, nº 91, Piso 1 e 0, Fração A, Lisboa",
  nipc: "519473108",
  phone: "+351 911 903 833",
  email: "contacto@sharkauto.pt",
  website: "www.sharkauto.pt",
  siteUrl: "https://www.sharkauto.pt",
} as const

/** Brand tagline shown on every document footer. */
export const TAGLINE = "Zero Conversas. Total Transparência."

/** Warranty summary reused across documents. */
export const WARRANTY_TEXT = "Garantia 6 meses / até 500€ — motor, transmissão e sistemas eletrónicos principais."

/** Legal footer line shared by all documents. */
export const LEGAL_FOOTER =
  `ESTIRPESÓBRIA – SOCIEDADE UNIPESSOAL LDA · Avenida Luís Bívar, nº 91, Lisboa · NIPC 519473108`

/** Small print for the formal quote (orçamento). */
export const ORCAMENTO_DISCLAIMER =
  "Orçamento sujeito a confirmação após inspeção física do veículo. Não constitui contrato de compra e venda."

/** Small print for the marketing proposal (proposta). */
export const PROPOSTA_DISCLAIMER =
  "Valores estimados, sujeitos a inspeção e confirmação. Não constitui proposta vinculativa."
