import { Document, Page, View, Text, Image } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { COMPANY_V2, LEGAL_FOOTER_V2 } from "@/lib/pdf/company"
import { formatEuro } from "@/lib/pdf/helpers"

export interface OrcamentoImportacaoProps {
  documentNumber: string
  propostaNumber: string | null
  emittedDate: string
  viatura: {
    marcaModelo: string
    ano: string
    quilometragem: string
    origem: string
    cilindrada: string
    co2: string
    matriculaOrigem: string
    vin: string
  }
  fotoOrigem: string | null
  custos: {
    precoOrigem: number
    isv: number
    taxaServico: number
    total: number
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesV2.fieldRow}>
      <Text style={stylesV2.fieldLabel}>{label}</Text>
      <Text style={stylesV2.fieldValue}>{value || "—"}</Text>
    </View>
  )
}

function CostRow({ label, note, value, destino }: { label: string; note: string; value: number; destino: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: brandV2.line }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 9 }}>{label}</Text>
        <Text style={{ fontSize: 7.5, color: brandV2.steel, marginTop: 2, lineHeight: 1.4 }}>{note}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10 }}>{formatEuro(value)}</Text>
        <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 6.5, letterSpacing: 1, color: brandV2.accent, marginTop: 2 }}>{destino}</Text>
      </View>
    </View>
  )
}

export function OrcamentoImportacaoDocument({ documentNumber, propostaNumber, emittedDate, viatura, fotoOrigem, custos }: OrcamentoImportacaoProps) {
  return (
    <Document>
      <Page size="A4" style={stylesV2.page}>
        <View style={stylesV2.headerRow}>
          <View>
            <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 8, letterSpacing: 0.5 }}>{COMPANY_V2.brandLine}</Text>
          </View>
          <View style={stylesV2.docMeta}>
            <Text>Orçamento n.º {documentNumber}</Text>
            {propostaNumber && <Text>Refere-se à proposta {propostaNumber}</Text>}
            <Text>Lisboa, {emittedDate}</Text>
          </View>
        </View>

        <Text style={stylesV2.title}>Orçamento de Importação</Text>
        <Text style={stylesV2.subtitle}>Discriminação de custos para viatura identificada na origem</Text>

        <Text style={stylesV2.sectionLabel}>Viatura identificada</Text>
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Marca e modelo" value={viatura.marcaModelo} />
            <Field label="Ano" value={viatura.ano} />
            <Field label="Quilometragem" value={viatura.quilometragem} />
            <Field label="Origem" value={viatura.origem} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Cilindrada" value={viatura.cilindrada} />
            <Field label="CO2" value={viatura.co2} />
            <Field label="Matrícula de origem" value={viatura.matriculaOrigem} />
            <Field label="VIN" value={viatura.vin} />
          </View>
        </View>

        {fotoOrigem && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={fotoOrigem} style={{ width: "100%", height: 140, objectFit: "cover", marginBottom: 12 }} />
        )}

        <Text style={stylesV2.sectionLabel}>Discriminação de custos</Text>
        <CostRow
          label="Preço do veículo na origem"
          note="Valor de aquisição negociado junto do vendedor. Pago pelo cliente directamente ao stand na origem, contra factura emitida em seu nome."
          value={custos.precoOrigem}
          destino="AO STAND"
        />
        <CostRow
          label="Taxa de serviço Shark"
          note="Inclui procura e negociação na origem, inspecção pré-compra, transporte, seguro em trânsito e todos os encargos documentais e notariais necessários à legalização."
          value={custos.taxaServico}
          destino="À SHARK"
        />
        <CostRow
          label="ISV — Imposto Sobre Veículos"
          note="Calculado por cilindrada e emissões de CO2, com redução por idade. Pago pelo cliente directamente à Autoridade Tributária e Aduaneira, por referência Multibanco emitida pela AT."
          value={custos.isv}
          destino="À AT (REF. MB)"
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 10 }}>
          <View>
            <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7, color: brandV2.steel }}>CUSTO TOTAL CHAVE NA MÃO</Text>
            <Text style={{ fontSize: 7, color: brandV2.steel, marginTop: 1 }}>Repartido por três destinatários · a Shark recebe apenas a taxa de serviço</Text>
          </View>
          <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 22, color: brandV2.accent }}>{formatEuro(custos.total)}</Text>
        </View>

        <Text style={[stylesV2.bodyText, { marginTop: 14 }]}>
          O valor acima não é pago à Shark Automotive na sua totalidade: o preço do veículo é liquidado directamente
          ao stand na origem e o ISV directamente à Autoridade Tributária e Aduaneira, por referência Multibanco
          emitida pela AT após a Declaração Aduaneira de Veículo. À Shark é devida apenas a taxa de serviço, e os
          comprovativos de cada pagamento ficam disponíveis no portal. Os valores são válidos por 15 dias; o ISV é
          estimativo e qualquer diferença é acertada contra o documento de liquidação da AT. Não incluem IUC do ano
          corrente nem seguro nacional.
        </Text>

        <View style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 8, color: brandV2.steel, textAlign: "center", marginBottom: 8 }}>
            Documento digital. A aceitação é feita no portal do cliente, sem necessidade de assinatura manuscrita.
          </Text>
          <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 9, color: brandV2.accent, borderWidth: 1, borderColor: brandV2.accent, paddingVertical: 8, paddingHorizontal: 20 }}>
            ACEITAR NO PORTAL
          </Text>
        </View>

        <Text style={stylesV2.footer}>{LEGAL_FOOTER_V2}</Text>
      </Page>
    </Document>
  )
}
