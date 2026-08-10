import { Font } from "@react-pdf/renderer"

/**
 * Brand palette for generated PDFs — exact values from the Shark document spec.
 * Gold is used at most ONCE per document (price only). No gradients/shadows/radius.
 */
export const brand = {
  navy: "#0D1B2A",
  navyLight: "#14273A",
  chalk: "#E8E4DC",
  chalkDark: "#C8C4BC",
  white: "#F4F8FC",
  steel: "#5A7A9A",
  gold: "#C9A24B",
  line: "#26384B",
}

let registered = false

/**
 * Registers the brand fonts with react-pdf. Safe to call multiple times.
 * Fonts are static woff files on disk (see assets/fonts), so registration
 * never hits the network at render time.
 */
export function registerPdfFonts() {
  if (registered) return

  // The deployed app uses react-pdf built-in fonts. Custom font files are not
  // guaranteed to be present in serverless bundles, so never register paths
  // that can turn every PDF route into a 500.
  Font.registerHyphenationCallback((word) => [word])
  registered = true
}
