import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { brand } from "@/lib/pdf/theme"
import { COMPANY, TAGLINE, WARRANTY_TEXT, LEGAL_FOOTER } from "@/lib/pdf/company"
import { formatEuro, formatNumber } from "@/lib/pdf/helpers"
import type { Vehicle } from "@/lib/types"

const styles = StyleSheet.create({
  page: {
    backgroundColor: brand.navy,
    paddingTop: 30,
    paddingBottom: 74,
    paddingHorizontal: 34,
    fontFamily: "DM Sans",
    color: brand.chalk,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: brand.line,
    paddingBottom: 12,
    marginBottom: 16,
  },
  brandName: { fontFamily: "Bebas Neue", fontSize: 26, color: brand.chalk, letterSpacing: 1 },
  brandSub: { fontFamily: "DM Mono", fontSize: 7, color: brand.steel, letterSpacing: 2, marginTop: 2 },
  registo: { fontFamily: "DM Mono", fontSize: 9, color: brand.chalkDark, letterSpacing: 1.5 },
  // Hero
  hero: { width: "100%", height: 230, objectFit: "cover", marginBottom: 16 },
  heroPlaceholder: {
    width: "100%",
    height: 230,
    backgroundColor: brand.navyLight,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  // Title
  vehicleTitle: { fontFamily: "Bebas Neue", fontSize: 38, color: brand.white, lineHeight: 0.98 },
  vehicleMeta: { fontFamily: "DM Mono", fontSize: 10, color: brand.steel, marginTop: 5, letterSpacing: 0.5 },
  divider: { borderBottomWidth: 1, borderBottomColor: brand.line, marginVertical: 14 },
  // Price + QR
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontFamily: "DM Mono", fontSize: 8, color: brand.steel, letterSpacing: 1.5, marginBottom: 3 },
  price: { fontFamily: "Bebas Neue", fontSize: 46, color: brand.gold, lineHeight: 1 },
  priceNote: { fontFamily: "DM Sans", fontSize: 8.5, color: brand.chalkDark, marginTop: 3 },
  qrWrap: { alignItems: "center" },
  qr: { width: 72, height: 72 },
  qrText: { fontFamily: "DM Mono", fontSize: 6, color: brand.steel, marginTop: 3, letterSpacing: 1 },
  // Protocol score
  scoreLabel: { fontFamily: "DM Mono", fontSize: 8, color: brand.chalkDark, letterSpacing: 2, marginBottom: 6 },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dotsRow: { flexDirection: "row", flexWrap: "wrap", width: "82%", gap: 2 },
  dot: { width: 8, height: 8 },
  scoreValue: { fontFamily: "Bebas Neue", fontSize: 22, color: brand.chalk },
  // Thumbnails
  thumbStrip: { flexDirection: "row", gap: 5, marginTop: 4 },
  thumb: { flex: 1, height: 52, objectFit: "cover" },
  // Warranty
  warrantyLabel: { fontFamily: "DM Mono", fontSize: 8, color: brand.chalkDark, letterSpacing: 2, marginBottom: 4 },
  warrantyText: { fontFamily: "DM Sans", fontSize: 9, color: brand.chalk, lineHeight: 1.4 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 34,
    right: 34,
    borderTopWidth: 1,
    borderTopColor: brand.line,
    paddingTop: 8,
  },
  tagline: { fontFamily: "DM Mono", fontSize: 8, color: brand.chalk, letterSpacing: 1, marginBottom: 4 },
  footerContacts: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  footerText: { fontFamily: "DM Mono", fontSize: 6.5, color: brand.steel, letterSpacing: 0.3 },
  legal: { fontFamily: "DM Mono", fontSize: 6, color: brand.steel, letterSpacing: 0.2 },
})

export interface WindowStickerProps {
  vehicle: Vehicle
  heroPhoto: string | null
  thumbnails: string[]
  qrDataUrl: string | null
  registo: string
}

function ScoreBar({ score }: { score: number }) {
  const total = 18
  const filled = Math.round((Math.min(150, Math.max(0, score)) / 150) * total)
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i < filled ? brand.chalk : brand.line }]} />
      ))}
    </View>
  )
}

export function WindowStickerDocument({ vehicle, heroPhoto, thumbnails, qrDataUrl, registo }: WindowStickerProps) {
  const title = `${vehicle.make} ${vehicle.model}`
  const metaParts = [
    String(vehicle.year),
    formatNumber(vehicle.mileage, " km"),
    vehicle.fuel_type,
    vehicle.power ? `${vehicle.power}cv` : null,
    vehicle.transmission,
  ].filter(Boolean)

  return (
    <Document title={`Ficha ${title} ${vehicle.year}`} author={COMPANY.brand} subject="Window Sticker">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>{COMPANY.brand}</Text>
            <Text style={styles.brandSub}>IMPORTADO · VERIFICADO · ENTREGUE</Text>
          </View>
          <Text style={styles.registo}>REGISTO {registo}</Text>
        </View>

        {/* Hero */}
        {heroPhoto ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={heroPhoto} style={styles.hero} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={{ fontFamily: "DM Mono", fontSize: 9, color: brand.steel }}>SEM FOTOGRAFIA</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.vehicleTitle}>{title}</Text>
        <Text style={styles.vehicleMeta}>{metaParts.join("  ·  ")}</Text>

        <View style={styles.divider} />

        {/* Price + QR */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>PREÇO</Text>
            <Text style={styles.price}>{formatEuro(vehicle.price)}</Text>
            {vehicle.financing_available && <Text style={styles.priceNote}>Financiamento disponível</Text>}
          </View>
          {qrDataUrl && (
            <View style={styles.qrWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qrDataUrl} style={styles.qr} />
              <Text style={styles.qrText}>VER ONLINE</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Protocol score */}
        <Text style={styles.scoreLabel}>PROTOCOLO SHARK 150</Text>
        <View style={styles.scoreRow}>
          <ScoreBar score={vehicle.protocol_score || 0} />
          <Text style={styles.scoreValue}>{vehicle.protocol_score || 0}/150</Text>
        </View>

        {/* Thumbnail strip */}
        {thumbnails.length > 0 && (
          <View style={styles.thumbStrip}>
            {thumbnails.slice(0, 5).map((t, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={i} src={t} style={styles.thumb} />
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* Warranty */}
        <Text style={styles.warrantyLabel}>GARANTIA</Text>
        <Text style={styles.warrantyText}>{WARRANTY_TEXT}</Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.tagline}>{TAGLINE}</Text>
          <View style={styles.footerContacts}>
            <Text style={styles.footerText}>
              {COMPANY.brand} · Lisboa · {COMPANY.phone}
            </Text>
            <Text style={styles.footerText}>{COMPANY.website}</Text>
          </View>
          <Text style={styles.legal}>{LEGAL_FOOTER}</Text>
        </View>
      </Page>
    </Document>
  )
}
