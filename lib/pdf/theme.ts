import { Font } from "@react-pdf/renderer"
import {
  bebasRegular,
  dmMonoMedium,
  dmMonoRegular,
  dmSansBold,
  dmSansMedium,
  dmSansRegular,
} from "@/lib/pdf/fonts-data"

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
  registered = true
  try {
    Font.register({ family: "Bebas Neue", fonts: [{ src: bebasRegular }] })
    Font.register({
      family: "DM Sans",
      fonts: [
        { src: dmSansRegular, fontWeight: 400 },
        { src: dmSansMedium, fontWeight: 500 },
        { src: dmSansBold, fontWeight: 700 },
      ],
    })
    Font.register({
      family: "DM Mono",
      fonts: [
        { src: dmMonoRegular, fontWeight: 400 },
        { src: dmMonoMedium, fontWeight: 500 },
      ],
    })
    Font.registerHyphenationCallback((word) => [word])
  } catch (err) {
    console.error("[v0] PDF font registration failed:", (err as Error).message)
  }
}
