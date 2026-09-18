import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { brandV2 } from "@/lib/pdf/theme-v2"
import { COMPANY_V2, LEGAL_FOOTER_V2 } from "@/lib/pdf/company"
import { WARRANTY_TERM } from "@/lib/warranty"
import { formatEuro, formatNumber } from "@/lib/pdf/helpers"
import type { Vehicle } from "@/lib/types"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9.5,
    color: brandV2.ink,
    backgroundColor: brandV2.white,
    padding: "14mm",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: brandV2.accent,
    paddingBottom: 10,
    marginBottom: 14,
  },
  tagline: { fontFamily: "Inter", fontWeight: 500, fontSize: 7, letterSpacing: 2, textTransform: "uppercase", color: brandV2.steel },
  eyebrow: { fontFamily: "Inter", fontWeight: 700, fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: brandV2.accent },
  ref: { fontFamily: "Inter", fontWeight: 500, fontSize: 8, color: brandV2.steelLight, marginTop: 2 },
  hero: { width: "100%", height: 190, objectFit: "cover", marginBottom: 14 },
  heroPlaceholder: {
    width: "100%", height: 190, backgroundColor: "#F3F4F6", marginBottom: 14,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontFamily: "Inter", fontWeight: 900, letterSpacing: -0.4, fontSize: 26, textTransform: "uppercase", lineHeight: 1.05 },
  originLine: { fontFamily: "Inter", fontWeight: 500, fontSize: 8.5, color: brandV2.steel, marginTop: 6 },
  divider: { borderBottomWidth: 1, borderBottomColor: brandV2.line, marginVertical: 12 },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  specItem: { width: "33%", marginBottom: 10 },
  specLabel: { fontFamily: "Inter", fontWeight: 500, fontSize: 6.5, letterSpacing: 1.5, textTransform: "uppercase", color: brandV2.steel, marginBottom: 2 },
  specValue: { fontFamily: "Inter", fontWeight: 700, fontSize: 11 },
  sectionLabel: {
    fontFamily: "Inter", fontWeight: 500, fontSize: 6.5, letterSpacing: 2, textTransform: "uppercase",
    color: brandV2.steel, marginBottom: 8,
  },
  equipGrid: { flexDirection: "row", flexWrap: "wrap" },
  equipItem: { width: "50%", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 },
  equipDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: brandV2.accent },
  equipText: { fontSize: 8.5 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  priceLabel: { fontFamily: "Inter", fontWeight: 500, fontSize: 7, letterSpacing: 1.5, textTransform: "uppercase", color: brandV2.steel, marginBottom: 3 },
  price: { fontFamily: "Inter", fontWeight: 900, fontSize: 30, color: brandV2.accent },
  badgeRow: { flexDirection: "row", gap: 6 },
  badge: {
    fontFamily: "Inter", fontWeight: 500, fontSize: 6.5, letterSpacing: 0.5, textTransform: "uppercase",
    color: brandV2.steel, borderWidth: 1, borderColor: brandV2.line, paddingVertical: 4, paddingHorizontal: 8,
  },
  qrWrap: { alignItems: "center" },
  qr: { width: 58, height: 58 },
  qrText: { fontFamily: "Inter", fontWeight: 500, fontSize: 6, color: brandV2.steel, marginTop: 3, letterSpacing: 1 },
  footer: {
    marginTop: "auto", paddingTop: 8, borderTopWidth: 1, borderTopColor: brandV2.lineFaint,
    fontFamily: "Inter", fontWeight: 500, fontSize: 6, lineHeight: 1.6, color: brandV2.steel, textAlign: "center",
  },
})

export interface WindowStickerProps {
  vehicle: Vehicle
  heroPhoto: string | null
  thumbnails: string[]
  qrDataUrl: string | null
  registo: string
}

function originLine(vehicle: Vehicle): string {
  const parts: string[] = []
  parts.push(vehicle.country_origin === "Nacional" ? "Stock nacional" : `Importada da ${vehicle.country_origin}`)
  parts.push("Legalizada e registada em Portugal")
  if (vehicle.inspection_status === "approved") parts.push("Inspecção pré-compra concluída")
  return parts.join(" · ")
}

export function WindowStickerDocument({ vehicle, heroPhoto, thumbnails, qrDataUrl, registo }: WindowStickerProps) {
  const title = `${vehicle.make} ${vehicle.model}`
  const equipment = vehicle.equipamento || []

  return (
    <Document title={`Ficha ${title} ${vehicle.year}`} author={COMPANY_V2.legalName} subject="Viatura em Stock">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.tagline}>Zero conversas · Total transparência</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.eyebrow}>Viatura em Stock</Text>
            <Text style={styles.ref}>Ref. {registo}</Text>
          </View>
        </View>

        {heroPhoto ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={heroPhoto} style={styles.hero} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={{ fontFamily: "Inter", fontSize: 9, color: brandV2.steel }}>SEM FOTOGRAFIA</Text>
          </View>
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.originLine}>{originLine(vehicle)}</Text>

        <View style={styles.divider} />

        <View style={styles.specGrid}>
          <View style={styles.specItem}><Text style={styles.specLabel}>Ano</Text><Text style={styles.specValue}>{vehicle.year}</Text></View>
          <View style={styles.specItem}><Text style={styles.specLabel}>Quilometragem</Text><Text style={styles.specValue}>{formatNumber(vehicle.mileage, " km")}</Text></View>
          <View style={styles.specItem}><Text style={styles.specLabel}>Combustível</Text><Text style={styles.specValue}>{vehicle.fuel_type}</Text></View>
          <View style={styles.specItem}><Text style={styles.specLabel}>Potência</Text><Text style={styles.specValue}>{vehicle.power} cv</Text></View>
          <View style={styles.specItem}><Text style={styles.specLabel}>Caixa</Text><Text style={styles.specValue}>{vehicle.transmission}</Text></View>
          <View style={styles.specItem}><Text style={styles.specLabel}>Garantia</Text><Text style={styles.specValue}>{WARRANTY_TERM}</Text></View>
        </View>

        <View style={styles.divider} />

        {thumbnails.length > 0 && (
          <>
            <View style={{ flexDirection: "row", gap: 5, marginBottom: 12 }}>
              {thumbnails.slice(0, 5).map((t, i) => (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image key={i} src={t} style={{ flex: 1, height: 48, objectFit: "cover" }} />
              ))}
            </View>
            <View style={styles.divider} />
          </>
        )}

        {equipment.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Equipamento</Text>
            <View style={styles.equipGrid}>
              {equipment.map((item, i) => (
                <View key={i} style={styles.equipItem}>
                  <View style={styles.equipDot} />
                  <Text style={styles.equipText}>{item}</Text>
                </View>
              ))}
            </View>
            <View style={styles.divider} />
          </>
        )}

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Preço chave na mão</Text>
            <Text style={styles.price}>{formatEuro(vehicle.price)}</Text>
            <View style={[styles.badgeRow, { marginTop: 6 }]}>
              <Text style={styles.badge}>Retoma aceite</Text>
              {vehicle.financing_available && <Text style={styles.badge}>Financiamento disponível</Text>}
            </View>
          </View>
          {qrDataUrl && (
            <View style={styles.qrWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qrDataUrl} style={styles.qr} />
              <Text style={styles.qrText}>VER ONLINE</Text>
            </View>
          )}
        </View>

        <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7, color: brandV2.accent, marginTop: 10 }}>
          sharkautomotive.pt
        </Text>

        <Text style={styles.footer}>{LEGAL_FOOTER_V2}</Text>
      </Page>
    </Document>
  )
}
