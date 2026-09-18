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

/** Warranty summary — stock vehicles only, never the encomenda/order flow. */
export const WARRANTY_TEXT = "Garantia de 18 meses por mútuo acordo."

/** Legal footer line shared by all documents. */
export const LEGAL_FOOTER =
  `ESTIRPESÓBRIA – SOCIEDADE UNIPESSOAL LDA · Avenida Luís Bívar, nº 91, Lisboa · NIPC 519473108`

/**
 * Extended legal identity for the v2 operation document suite (Contrato,
 * Procuração, Declarações, Proposta/Orçamento de Importação) — these need
 * Capital Social and IBAN, which the older COMPANY/LEGAL_FOOTER above don't
 * carry. Spelling ("ESTIRPESOBRIA", no accent) and the full postal code
 * follow the source mockup verbatim — flagged to the client as a possible
 * discrepancy with the existing COMPANY.legalName spelling, not silently
 * reconciled.
 */
export const COMPANY_V2 = {
  legalName: "ESTIRPESOBRIA, UNIPESSOAL LDA",
  brandLine: "ESTIRPESOBRIA, UNIPESSOAL LDA · IMPORTAÇÃO DE AUTOMÓVEIS",
  address: "Avenida Luís Bívar, nº 91, Piso -1 e 0, fração A, 1069-141 Lisboa",
  nif: "519473108",
  capitalSocial: "2.500,00€",
  iban: "PT50 0033 0000 4584 3610 1870 5",
} as const

/** Footer line for the v2 document suite — matches the mockup exactly. */
export const LEGAL_FOOTER_V2 =
  `${COMPANY_V2.legalName} (Shark Automotive)  |  Sede: ${COMPANY_V2.address}  |  NIF: ${COMPANY_V2.nif}  |  Capital Social: ${COMPANY_V2.capitalSocial}  |  IBAN: ${COMPANY_V2.iban}`

/** Small print for the formal quote (orçamento). */
export const ORCAMENTO_DISCLAIMER =
  "Orçamento sujeito a confirmação após inspeção física do veículo. Não constitui contrato de compra e venda."

/** Small print for the marketing proposal (proposta). */
export const PROPOSTA_DISCLAIMER =
  "Valores estimados, sujeitos a inspeção e confirmação. Não constitui proposta vinculativa."
