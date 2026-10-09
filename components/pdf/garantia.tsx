import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { COMPANY_V2, LEGAL_FOOTER_V2 } from "@/lib/pdf/company"
import { formatDatePt, formatEuroPt, formatKmPt } from "@/lib/garantias/format"
import { validationUrl } from "@/lib/garantias/template"
import type { GarantiaSnapshot } from "@/lib/garantias/types"

export interface GarantiaPdfProps {
  snapshot: GarantiaSnapshot
  qrDataUrl: string | null
  /** SHA-256 da versão guardada; mostra-se abreviado no rodapé para conferência. */
  hash: string
}

const s = StyleSheet.create({
  page: { ...stylesV2.page, paddingTop: "11mm", paddingBottom: "24mm", paddingHorizontal: "14mm", fontSize: 8.5 },
  headerRow: { ...stylesV2.headerRow, marginBottom: 12 },
  viaBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: brandV2.accent,
    color: brandV2.accent,
    fontFamily: "Inter",
    fontWeight: 700,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  title: { ...stylesV2.title, fontSize: 17, marginBottom: 8 },
  cols: { flexDirection: "row", gap: 16, marginBottom: 10 },
  col: { flex: 1 },
  pair: { flexDirection: "row", marginBottom: 3 },
  pairLabel: { width: 62, fontFamily: "Inter", fontWeight: 500, fontSize: 6.8, color: brandV2.steelLight },
  pairValue: { flex: 1, fontSize: 8.5 },
  intro: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 8 },
  clauseTitle: { fontFamily: "Inter", fontWeight: 700, fontSize: 8, marginBottom: 1.5 },
  clauseText: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify" },
  closing: { fontSize: 8, color: brandV2.steel, marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  sigBox: { width: "46%" },
  sigLine: { borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 3 },
  sigRole: { fontFamily: "Inter", fontWeight: 500, fontSize: 7 },
  sigName: { fontFamily: "Inter", fontWeight: 900, fontSize: 8.5, textTransform: "uppercase", marginTop: 1 },
  sigDate: { fontFamily: "Inter", fontWeight: 500, fontSize: 7.5, marginTop: 8 },
  verifyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  qr: { width: 46, height: 46 },
  verifyText: { fontSize: 7, color: brandV2.steel, lineHeight: 1.5, flex: 1 },
  footer: {
    position: "absolute",
    left: "14mm",
    right: "14mm",
    bottom: "9mm",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: brandV2.lineFaint,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 5.8,
    lineHeight: 1.6,
    color: brandV2.steel,
    textAlign: "center",
  },
})

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.pair}>
      <Text style={s.pairLabel}>{label}</Text>
      <Text style={s.pairValue}>{value || "—"}</Text>
    </View>
  )
}

function Via({ label, props }: { label: string; props: GarantiaPdfProps }) {
  const { snapshot: d, qrDataUrl, hash } = props
  const url = validationUrl(d.codigo_verificacao)
  const emitida = d.emitida_em ? formatDatePt(d.emitida_em) : ""

  return (
    <Page size="A4" style={s.page}>
      <View style={s.headerRow}>
        <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 8, letterSpacing: 0.5 }}>{COMPANY_V2.brandLine}</Text>
        <View style={stylesV2.docMeta}>
          <Text>Garantia n.º {d.numero}</Text>
          <Text>
            Versão {d.versao}
            {emitida ? ` · emitida em ${emitida}` : ""}
          </Text>
        </View>
      </View>

      <Text style={s.title}>Declaração de Garantia</Text>
      <Text style={s.viaBadge}>{label}</Text>

      <View style={s.cols}>
        <View style={s.col}>
          <Text style={stylesV2.sectionLabel}>Comprador</Text>
          <Pair label="Nome" value={d.cliente.nome} />
          <Pair label="NIF" value={d.cliente.nif} />
          <Pair label="Morada" value={d.cliente.morada} />
          <Pair label="Contacto" value={d.cliente.contacto} />
        </View>
        <View style={s.col}>
          <Text style={stylesV2.sectionLabel}>Veículo</Text>
          <Pair label="Marca/Modelo" value={`${d.viatura.marca} ${d.viatura.modelo}`} />
          <Pair label="Matrícula" value={d.viatura.matricula} />
          <Pair label="VIN" value={d.viatura.vin} />
          <Pair label="Quilómetros" value={`${formatKmPt(d.viatura.km)} km`} />
        </View>
        <View style={s.col}>
          <Text style={stylesV2.sectionLabel}>Venda e garantia</Text>
          <Pair label="Venda" value={`${formatDatePt(d.venda.data)} · ${formatEuroPt(d.venda.valor)}`} />
          <Pair label="Prazo" value={`${d.garantia.prazo_meses} meses por mútuo acordo`} />
          <Pair label="Início" value={formatDatePt(d.garantia.data_inicio)} />
          <Pair label="Termo" value={formatDatePt(d.garantia.data_fim)} />
        </View>
      </View>

      <Text style={s.intro}>{d.conteudo.introducao}</Text>

      {d.conteudo.clausulas.map((c, i) => (
        <View key={i} style={{ marginBottom: 6 }} wrap={false}>
          <Text style={s.clauseTitle}>
            {i + 1}. {c.titulo}
          </Text>
          <Text style={s.clauseText}>{c.texto}</Text>
        </View>
      ))}

      <Text style={s.closing}>O presente documento é emitido em duas vias, ficando uma em poder de cada parte.</Text>

      <View style={s.sigRow} wrap={false}>
        <View style={s.sigBox}>
          <View style={{ height: 30 }} />
          <View style={s.sigLine}>
            <Text style={s.sigRole}>O Vendedor</Text>
            <Text style={s.sigName}>Shark Automotive</Text>
            <Text style={s.sigDate}>Data: ______ / ______ / __________</Text>
          </View>
        </View>
        <View style={s.sigBox}>
          <View style={{ height: 30 }} />
          <View style={s.sigLine}>
            <Text style={s.sigRole}>O Comprador</Text>
            <Text style={s.sigName}>{d.cliente.nome}</Text>
            <Text style={s.sigDate}>Data: ______ / ______ / __________</Text>
          </View>
        </View>
      </View>

      <View style={s.verifyRow} wrap={false}>
        {qrDataUrl && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={qrDataUrl} style={s.qr} />
        )}
        <Text style={s.verifyText}>
          Verifique a autenticidade e a validade desta garantia em {url}
          {"\n"}
          {d.numero} · versão {d.versao} · ref. {hash.slice(0, 12)}
        </Text>
      </View>

      <Text style={s.footer} fixed>
        {LEGAL_FOOTER_V2}
      </Text>
    </Page>
  )
}

/** Duas vias (cliente e vendedor), cada uma em páginas A4 próprias, com o mesmo conteúdo congelado da versão. */
export function GarantiaDocument(props: GarantiaPdfProps) {
  return (
    <Document
      title={`Garantia ${props.snapshot.numero} v${props.snapshot.versao}`}
      author="Shark Automotive"
      subject="Declaração de Garantia"
    >
      <Via label="Via do Cliente" props={props} />
      <Via label="Via do Vendedor" props={props} />
    </Document>
  )
}
