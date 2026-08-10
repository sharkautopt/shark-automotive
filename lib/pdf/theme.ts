import path from "path"
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
  const dir = path.join(process.cwd(), "assets", "fonts")

  Font.register({
    family: "Bebas Neue",
    fonts: [{ src: path.join(dir, "BebasNeue-Regular.woff") }],
  })

  Font.register({
    family: "DM Sans",
    fonts: [
      { src: path.join(dir, "DMSans-Regular.woff"), fontWeight: 400 },
      { src: path.join(dir, "DMSans-Medium.woff"), fontWeight: 500 },
      { src: path.join(dir, "DMSans-Bold.woff"), fontWeight: 700 },
    ],
  })

  Font.register({
    family: "DM Mono",
    fonts: [
      { src: path.join(dir, "DMMono-Regular.woff"), fontWeight: 400 },
      { src: path.join(dir, "DMMono-Medium.woff"), fontWeight: 500 },
    ],
  })

  // Prevent hyphenation splitting of long words (VINs, model names).
  Font.registerHyphenationCallback((word) => [word])

  registered = true
}
