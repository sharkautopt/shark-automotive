import QRCode from "qrcode"

/** Format a number as EUR currency in pt-PT (e.g. "45.900 €"). */
export function formatEuro(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format an integer with pt-PT thousands separators (e.g. "45 000 km"). */
export function formatNumber(value: number | null | undefined, suffix = ""): string {
  if (value == null || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("pt-PT").format(value) + suffix
}

/** Format an ISO date string as pt-PT (e.g. "03/2021"). */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

/**
 * Generate a QR code as a PNG data URL, styled in brand colors.
 * Returns null on failure so the PDF can render without it.
 */
export async function generateQrDataUrl(url: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(url, {
      margin: 1,
      width: 240,
      color: { dark: "#0B1220", light: "#FFFFFF" },
    })
  } catch {
    return null
  }
}
