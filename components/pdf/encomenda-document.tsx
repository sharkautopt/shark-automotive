import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { brand } from "@/lib/pdf/theme"
import {
  COMPANY,
  TAGLINE,
  LEGAL_FOOTER,
  ORCAMENTO_DISCLAIMER,
  PROPOSTA_DISCLAIMER,
} from "@/lib/pdf/company"
import { formatEuro } from "@/lib/pdf/helpers"
import { SERVICE_FEE_INCLUDES } from "@/lib/pdf/fees"

export interface EncomendaVehicle {
  make: string
  model: string
  year: string
  mileage: string
  fuel: string
  power: string
  colour: string
  origin: string
  // Extended specs (all optional, pre-formatted display strings)
  variant?: string
  firstRegistration?: string
  displacement?: string
  transmission?: string
  drivetrain?: string
  doors?: string
  seats?: string
  bodyType?: string
  interior?: string
  co2?: string
  vin?: string
  owners?: string
  summary?: string
  features?: string[]
}

export interface EncomendaCosts {
  vehiclePrice: number
  isv: number
  /** All-inclusive Shark service fee (0 when on request). */
  serviceFee: number
  /** True when the price band is "sob consulta" (> 95.000 €). */
  serviceFeeOnRequest?: boolean
  total: number
}

export interface EncomendaDocProps {
  mode: "proposta" | "orcamento"
  clientName: string
  vehicle: EncomendaVehicle
  photos: string[]
  qrDataUrl: string | null
  // proposta
  fromPrice?: number
  // orcamento
  documentNumber?: string
  date?: string
  validUntil?: string
  deliveryTime?: string
  costs?: EncomendaCosts
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: brand.navy,
    paddingTop: 30,
    paddingBottom: 78,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    color: brand.chalk,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: brand.line,
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerLeft: { flexShrink: 1, paddingRight: 12 },
  headerRight: { flexShrink: 0, alignItems: "flex-end" },
  brandName: { fontFamily: "Helvetica-Bold", fontSize: 26, color: brand.chalk, letterSpacing: 1 },
  brandSub: { fontFamily: "Courier", fontSize: 7, color: brand.steel, letterSpacing: 2, marginTop: 2 },
  docType: { fontFamily: "Helvetica-Bold", fontSize: 18, color: brand.chalk, paddingLeft: 6, paddingRight: 1 },
  docNumber: { fontFamily: "Courier", fontSize: 8, color: brand.steel, textAlign: "right", marginTop: 2 },

  metaBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  metaItem: {},
  metaKey: { fontFamily: "Courier", fontSize: 7, color: brand.steel, letterSpacing: 1, marginBottom: 2 },
  metaVal: { fontFamily: "Helvetica", fontSize: 11, fontWeight: 500, color: brand.white },

  // photos — 1 large + 2x2 square, all equal height
  photoRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  photoBig: { flex: 1, objectFit: "cover" },
  photoQuad: { flex: 1, gap: 6 },
  quadRow: { flex: 1, flexDirection: "row", gap: 6 },
  quadCell: { flex: 1, objectFit: "cover" },
  photoPlaceholder: {
    width: "100%",
    backgroundColor: brand.navyLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  vehicleTitle: { fontFamily: "Helvetica-Bold", fontSize: 34, color: brand.white, lineHeight: 1 },
  vehicleVariant: { fontFamily: "Helvetica", fontSize: 11, fontWeight: 500, color: brand.chalkDark, marginTop: 2 },
  vehicleMeta: { fontFamily: "Courier", fontSize: 10, color: brand.steel, marginTop: 4 },
  summary: { fontFamily: "Helvetica", fontSize: 9.5, color: brand.chalk, lineHeight: 1.5, marginTop: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: brand.line, marginVertical: 14 },
  dividerTight: { borderBottomWidth: 1, borderBottomColor: brand.line, marginVertical: 9 },

  sectionLabel: { fontFamily: "Courier", fontSize: 8, color: brand.chalkDark, letterSpacing: 2, marginBottom: 8 },

  // spec grid (two columns)
  specGrid: { flexDirection: "row", flexWrap: "wrap" },
  specCell: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingRight: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: brand.line,
  },
  specCellFull: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: brand.line,
  },
  specKey: { fontFamily: "Helvetica", fontSize: 9, color: brand.chalkDark },
  specVal: { fontFamily: "Helvetica", fontSize: 9, fontWeight: 500, color: brand.white, textAlign: "right" },

  // features
  featureRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  featureChip: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: brand.chalk,
    borderWidth: 0.5,
    borderColor: brand.line,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 5,
    marginBottom: 5,
  },

  // proposta estimate
  estimateLabel: { fontFamily: "Courier", fontSize: 8, color: brand.steel, letterSpacing: 1.5, marginBottom: 3 },
  estimate: { fontFamily: "Helvetica-Bold", fontSize: 40, color: brand.gold, lineHeight: 1 },
  estimateNote: { fontFamily: "Helvetica", fontSize: 8.5, color: brand.chalkDark, marginTop: 3 },
  includes: { fontFamily: "Helvetica", fontSize: 9.5, color: brand.chalk, lineHeight: 1.5, marginTop: 4 },

  // cost table
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 5 },
  costKey: { fontFamily: "Helvetica", fontSize: 10, color: brand.chalk },
  costSub: { fontFamily: "Helvetica", fontSize: 7.5, color: brand.steel, marginTop: 1, maxWidth: 320, lineHeight: 1.35 },
  costVal: { fontFamily: "Courier", fontSize: 10, color: brand.chalk },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: brand.line,
  },
  totalKey: { fontFamily: "Helvetica-Bold", fontSize: 18, color: brand.chalk, letterSpacing: 0.5 },
  totalVal: { fontFamily: "Helvetica-Bold", fontSize: 22, color: brand.gold },

  ctaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  ctaText: { fontFamily: "Helvetica-Bold", fontSize: 20, color: brand.chalk, maxWidth: "70%" },
  qr: { width: 72, height: 72 },
  qrText: { fontFamily: "Courier", fontSize: 6, color: brand.steel, marginTop: 3, letterSpacing: 1, textAlign: "center" },

  smallPrint: { fontFamily: "Helvetica", fontSize: 7.5, color: brand.steel, lineHeight: 1.4, marginTop: 12 },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: brand.line,
    paddingTop: 8,
  },
  tagline: { fontFamily: "Courier", fontSize: 8, color: brand.chalk, letterSpacing: 1, marginBottom: 4 },
  footerContacts: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  footerText: { fontFamily: "Courier", fontSize: 6.5, color: brand.steel },
  legal: { fontFamily: "Courier", fontSize: 6, color: brand.steel },
})

/** Build the [label, value] spec rows, skipping empty values. */
function buildSpecRows(v: EncomendaVehicle): Array<[string, string, boolean]> {
  const has = (s?: string) => !!s && s.trim() !== "" && s.trim() !== "—"
  const rows: Array<[string, string, boolean] | null> = [
    ["Marca / Modelo", `${v.make} ${v.model}`.trim(), false],
    has(v.variant) ? ["Versão", v.variant!, false] : null,
    ["Ano", has(v.firstRegistration) ? v.firstRegistration! : v.year || "—", false],
    ["Quilometragem", v.mileage || "—", false],
    ["Combustível", v.fuel || "—", false],
    ["Potência", v.power || "—", false],
    has(v.displacement) ? ["Cilindrada", v.displacement!, false] : null,
    has(v.transmission) ? ["Caixa", v.transmission!, false] : null,
    has(v.drivetrain) ? ["Tração", v.drivetrain!, false] : null,
    has(v.bodyType) ? ["Carroçaria", v.bodyType!, false] : null,
    has(v.doors) || has(v.seats)
      ? ["Portas / Lugares", `${v.doors || "—"} / ${v.seats || "—"}`, false]
      : null,
    ["Cor", v.colour || "—", false],
    has(v.interior) ? ["Interior", v.interior!, false] : null,
    has(v.co2) ? ["CO₂", v.co2!, false] : null,
    has(v.owners) ? ["Proprietários", v.owners!, false] : null,
    ["Origem", v.origin || "—", false],
    has(v.vin) ? ["Chassis (VIN)", v.vin!, true] : null,
  ]
  return rows.filter((r): r is [string, string, boolean] => r !== null)
}

function SpecGrid({ vehicle }: { vehicle: EncomendaVehicle }) {
  const rows = buildSpecRows(vehicle)
  return (
    <View style={styles.specGrid}>
      {rows.map(([k, val, full], i) => (
        <View key={`${k}-${i}`} style={full ? styles.specCellFull : styles.specCell}>
          <Text style={styles.specKey}>{k}</Text>
          <Text style={styles.specVal}>{val}</Text>
        </View>
      ))}
    </View>
  )
}

function Photos({ photos, height }: { photos: string[]; height: number }) {
  if (photos.length === 0) {
    return (
      <View style={[styles.photoPlaceholder, { height }]}>
        <Text style={{ fontFamily: "Courier", fontSize: 9, color: brand.steel }}>SEM FOTOGRAFIA</Text>
      </View>
    )
  }

  const [main, ...rest] = photos

  // Single photo: full-width hero.
  if (rest.length === 0) {
    return (
      <View style={styles.photoRow}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={main} style={[styles.photoBig, { height }]} />
      </View>
    )
  }

  const quad = rest.slice(0, 4)
  const topRow = quad.slice(0, 2)
  const bottomRow = quad.slice(2, 4)

  return (
    <View style={[styles.photoRow, { height }]}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={main} style={styles.photoBig} />
      <View style={styles.photoQuad}>
        <View style={styles.quadRow}>
          {topRow.map((p, i) => (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image key={`t${i}`} src={p} style={styles.quadCell} />
          ))}
        </View>
        {bottomRow.length > 0 && (
          <View style={styles.quadRow}>
            {bottomRow.map((p, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={`b${i}`} src={p} style={styles.quadCell} />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

function Footer() {
  return (
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
  )
}

export function EncomendaDocument(props: EncomendaDocProps) {
  const { mode, clientName, vehicle, photos, qrDataUrl } = props
  const title = `${vehicle.make} ${vehicle.model}`.trim() || "Viatura"
  const metaParts = [vehicle.year, vehicle.mileage, vehicle.colour, vehicle.origin].filter(Boolean)
  const photoHeight = mode === "orcamento" ? 150 : 190
  const features = (vehicle.features || []).filter((f) => f && f.trim()).slice(0, 8)

  return (
    <Document
      title={`${mode === "orcamento" ? "Orçamento" : "Proposta"} ${clientName}`}
      author={COMPANY.brand}
      subject={mode === "orcamento" ? "Orçamento Formal" : "Proposta de Viatura"}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandName}>{COMPANY.brand}</Text>
            <Text style={styles.brandSub}>IMPORTAÇÃO PREMIUM POR ENCOMENDA</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docType}>{mode === "orcamento" ? "ORÇAMENTO" : "PROPOSTA"}</Text>
            {mode === "orcamento" && props.documentNumber && (
              <Text style={styles.docNumber}>Nº {props.documentNumber}</Text>
            )}
          </View>
        </View>

        {/* Meta bar */}
        <View style={styles.metaBar}>
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>PREPARADO PARA</Text>
            <Text style={styles.metaVal}>{clientName || "—"}</Text>
          </View>
          {mode === "orcamento" && (
            <>
              <View style={styles.metaItem}>
                <Text style={styles.metaKey}>DATA</Text>
                <Text style={styles.metaVal}>{props.date || "—"}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaKey}>VÁLIDO ATÉ</Text>
                <Text style={styles.metaVal}>{props.validUntil || "—"}</Text>
              </View>
            </>
          )}
        </View>

        {/* Photos */}
        <Photos photos={photos} height={photoHeight} />

        {/* Title */}
        <Text style={styles.vehicleTitle}>{title}</Text>
        {vehicle.variant && vehicle.variant.trim() && (
          <Text style={styles.vehicleVariant}>{vehicle.variant}</Text>
        )}
        {metaParts.length > 0 && <Text style={styles.vehicleMeta}>{metaParts.join("  ·  ")}</Text>}
        {mode === "proposta" && vehicle.summary && vehicle.summary.trim() && (
          <Text style={styles.summary}>{vehicle.summary}</Text>
        )}

        <View style={mode === "orcamento" ? styles.dividerTight : styles.divider} />

        {mode === "proposta" ? (
          <>
            <Text style={styles.sectionLabel}>ESPECIFICAÇÃO</Text>
            <SpecGrid vehicle={vehicle} />
            {features.length > 0 && (
              <>
                <View style={styles.dividerTight} />
                <Text style={styles.sectionLabel}>EQUIPAMENTO</Text>
                <View style={styles.featureRow}>
                  {features.map((f, i) => (
                    <Text key={i} style={styles.featureChip}>
                      {f}
                    </Text>
                  ))}
                </View>
              </>
            )}
            <View style={styles.divider} />
            <Text style={styles.estimateLabel}>ESTIMATIVA</Text>
            <Text style={styles.estimate}>a partir de {formatEuro(props.fromPrice)}</Text>
            <Text style={styles.estimateNote}>(sujeito a inspeção e confirmação)</Text>
            <View style={styles.dividerTight} />
            <Text style={styles.sectionLabel}>INCLUI</Text>
            <Text style={styles.includes}>
              Protocolo Shark 150 · Transporte e seguro · Legalização e ISV · Encargos documentais e notariais ·
              Garantia de 6 meses.
            </Text>
            <View style={styles.divider} />
            <View style={styles.ctaRow}>
              <Text style={styles.ctaText}>Interessado? Fale connosco e agende uma chamada.</Text>
              {qrDataUrl && (
                <View>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={qrDataUrl} style={styles.qr} />
                  <Text style={styles.qrText}>CONTACTO</Text>
                </View>
              )}
            </View>
            <Text style={styles.smallPrint}>{PROPOSTA_DISCLAIMER}</Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>ESPECIFICAÇÃO</Text>
            <SpecGrid vehicle={vehicle} />
            <View style={styles.dividerTight} />
            <Text style={styles.sectionLabel}>DISCRIMINAÇÃO DE CUSTOS</Text>
            {props.costs && (
              <View wrap={false}>
                <View style={styles.costRow}>
                  <Text style={styles.costKey}>Preço do veículo (origem)</Text>
                  <Text style={styles.costVal}>{formatEuro(props.costs.vehiclePrice)}</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costKey}>ISV estimado</Text>
                  <Text style={styles.costVal}>{formatEuro(props.costs.isv)}</Text>
                </View>
                <View style={styles.costRow}>
                  <View style={{ maxWidth: 340 }}>
                    <Text style={styles.costKey}>Taxa de serviço Shark</Text>
                    <Text style={styles.costSub}>{SERVICE_FEE_INCLUDES}</Text>
                  </View>
                  <Text style={styles.costVal}>
                    {props.costs.serviceFeeOnRequest ? "sob consulta" : formatEuro(props.costs.serviceFee)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalKey}>TOTAL CHAVE-NA-MÃO</Text>
                  <Text style={styles.totalVal}>
                    {props.costs.serviceFeeOnRequest ? "sob consulta" : formatEuro(props.costs.total)}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.dividerTight} />
            <View style={styles.metaBar}>
              <View style={styles.metaItem}>
                <Text style={styles.metaKey}>PRAZO ESTIMADO</Text>
                <Text style={styles.metaVal}>{props.deliveryTime || "2-4 semanas"}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaKey}>GARANTIA INCLUÍDA</Text>
                <Text style={styles.metaVal}>6 meses / 500€</Text>
              </View>
            </View>
            <Text style={styles.smallPrint}>{ORCAMENTO_DISCLAIMER}</Text>
          </>
        )}

        <Footer />
      </Page>
    </Document>
  )
}
