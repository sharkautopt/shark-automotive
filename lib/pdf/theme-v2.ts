import { Font, StyleSheet } from "@react-pdf/renderer"
import { interBlack, interBold, interMedium, interRegular } from "@/lib/pdf/fonts-data"

/**
 * Design language for the operation document suite (Contrato, Procuração,
 * Declaração de Circulação/Entrega, Proposta/Orçamento de Importação,
 * Ficha de viatura em stock) — Inter + blue accent, matching the app's own
 * design system, per "Shark Documentos v2". Deliberately separate from
 * lib/pdf/theme.ts (Bebas Neue/DM Sans/gold), which stays untouched — those
 * are the existing encomenda/window-sticker documents, out of scope here.
 */
export const brandV2 = {
  ink: "#0A111C",
  panel: "#0F1826",
  accent: "#2F80ED",
  steel: "#6B7280",
  steelLight: "#94A0B0",
  line: "rgba(148,160,176,0.26)",
  lineFaint: "rgba(148,160,176,0.18)",
  white: "#FFFFFF",
}

let registeredV2 = false

export function registerPdfFontsV2() {
  if (registeredV2) return
  registeredV2 = true
  try {
    Font.register({
      family: "Inter",
      fonts: [
        { src: interRegular, fontWeight: 400 },
        { src: interMedium, fontWeight: 500 },
        { src: interBold, fontWeight: 700 },
        { src: interBlack, fontWeight: 900 },
      ],
    })
    Font.registerHyphenationCallback((word) => [word])
  } catch (err) {
    console.error("[v0] PDF Inter font registration failed:", (err as Error).message)
  }
}

/** Shared style primitives reused across all 7 v2 documents. */
export const stylesV2 = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9.5,
    color: brandV2.ink,
    backgroundColor: brandV2.white,
    padding: "14mm",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: brandV2.accent,
    paddingBottom: 10,
    marginBottom: 18,
  },
  brand: { fontFamily: "Inter", fontWeight: 900, fontSize: 15, letterSpacing: -0.4, textTransform: "uppercase" },
  brandSub: { fontFamily: "Inter", fontWeight: 500, fontSize: 6, letterSpacing: 2, textTransform: "uppercase", color: brandV2.steel, marginTop: 3 },
  docMeta: { textAlign: "right", fontFamily: "Inter", fontWeight: 500, fontSize: 7.5, color: brandV2.steelLight, lineHeight: 1.8 },
  title: { fontFamily: "Inter", fontWeight: 900, letterSpacing: -0.4, fontSize: 20, textTransform: "uppercase", textAlign: "center", marginBottom: 14 },
  subtitle: { fontFamily: "Inter", fontWeight: 500, fontSize: 9, color: brandV2.steelLight, textAlign: "center", marginTop: -10, marginBottom: 14 },
  sectionLabel: {
    fontFamily: "Inter", fontWeight: 500, fontSize: 6.5, letterSpacing: 2, textTransform: "uppercase",
    color: brandV2.steel, borderBottomWidth: 1, borderBottomColor: brandV2.line, paddingBottom: 4, marginBottom: 8,
  },
  fieldRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 6 },
  fieldLabel: { width: 90, fontFamily: "Inter", fontWeight: 500, fontSize: 7, color: brandV2.steelLight },
  fieldValue: { flex: 1, borderBottomWidth: 1, borderBottomColor: brandV2.line, paddingBottom: 2, fontSize: 9.5 },
  bodyText: { fontSize: 9, lineHeight: 1.6, textAlign: "justify" },
  bodyTextBold: { fontSize: 9, lineHeight: 1.6, fontWeight: 700 },
  footer: {
    marginTop: "auto", paddingTop: 8, borderTopWidth: 1, borderTopColor: brandV2.lineFaint,
    fontFamily: "Inter", fontWeight: 500, fontSize: 6, lineHeight: 1.6, color: brandV2.steel, textAlign: "center",
  },
})
