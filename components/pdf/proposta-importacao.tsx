import { Document, Page, View, Text } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { COMPANY_V2, LEGAL_FOOTER_V2 } from "@/lib/pdf/company"

export interface PropostaImportacaoProps {
  documentNumber: string
  emittedDate: string
  cliente: { nome: string; nif: string; morada: string; contacto: string }
  viatura: {
    marcaModelo: string
    segmento: string
    origem: string
    anoKmMax: string
    combustivel: string
    caixa: string
    equipamentoExigido: string
  }
  condicoes: {
    orcamentoMaximo: string
    sinal: string
    prazoEntrega: string
    validade: string
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

export function PropostaImportacaoDocument({ documentNumber, emittedDate, cliente, viatura, condicoes }: PropostaImportacaoProps) {
  return (
    <Document>
      <Page size="A4" style={stylesV2.page}>
        <View style={stylesV2.headerRow}>
          <View>
            <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 8, letterSpacing: 0.5 }}>{COMPANY_V2.brandLine}</Text>
          </View>
          <View style={stylesV2.docMeta}>
            <Text>Proposta n.º {documentNumber}</Text>
            <Text>Lisboa, {emittedDate}</Text>
          </View>
        </View>

        <Text style={stylesV2.title}>Proposta de Importação</Text>
        <Text style={stylesV2.subtitle}>Condições de procura, aquisição e entrega de viatura por encomenda</Text>

        <Text style={stylesV2.sectionLabel}>Cliente</Text>
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Nome" value={cliente.nome} />
            <Field label="NIF" value={cliente.nif} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Morada" value={cliente.morada} />
            <Field label="Contacto" value={cliente.contacto} />
          </View>
        </View>

        <Text style={stylesV2.sectionLabel}>Viatura pretendida</Text>
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Marca e modelo" value={viatura.marcaModelo} />
            <Field label="Segmento" value={viatura.segmento} />
            <Field label="Origem" value={viatura.origem} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Ano / km máximo" value={viatura.anoKmMax} />
            <Field label="Combustível" value={viatura.combustivel} />
            <Field label="Caixa" value={viatura.caixa} />
          </View>
        </View>
        <Text style={[stylesV2.fieldLabel, { width: "auto", marginBottom: 2 }]}>Equipamento exigido e exclusões</Text>
        <Text style={[stylesV2.bodyText, { marginBottom: 12 }]}>{viatura.equipamentoExigido || "—"}</Text>

        <Text style={stylesV2.sectionLabel}>Condições</Text>
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Field label="Orçamento máximo (chave na mão)" value={condicoes.orcamentoMaximo} />
            <Field label="Sinal à adjudicação" value={condicoes.sinal} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Prazo estimado de entrega" value={condicoes.prazoEntrega} />
            <Field label="Validade da proposta" value={condicoes.validade} />
          </View>
        </View>

        <Text style={[stylesV2.bodyText, { marginBottom: 8 }]}>
          A Shark Automotive obriga-se a procurar, inspeccionar e negociar na origem uma viatura conforme à
          especificação acima, apresentando ao cliente o relatório de inspecção e o orçamento detalhado antes de
          qualquer compromisso de compra. A inspecção é feita antes da aquisição; não sendo encontrada viatura
          conforme dentro do orçamento máximo, o sinal é devolvido na íntegra, sem encargos para o cliente.
        </Text>
        <Text style={stylesV2.bodyText}>
          A adjudicação depende de aceitação expressa do orçamento de importação, que discrimina o preço na origem,
          o ISV estimado e a taxa de serviço, identificando o destinatário de cada pagamento. O preço do veículo é
          pago pelo cliente directamente ao stand na origem; o ISV é pago directamente à Autoridade Tributária e
          Aduaneira por referência Multibanco emitida pela AT; à Shark Automotive é devida apenas a taxa de serviço.
          Os valores de ISV são estimativos e a liquidação final é da AT, sendo eventuais diferenças acertadas com o
          cliente.
        </Text>

        <View style={{ marginTop: "auto", paddingTop: 30, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ textAlign: "center", minWidth: 160 }}>
            <View style={{ height: 40 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>O Cliente</Text>
              <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 9, textTransform: "uppercase", marginTop: 2 }}>{cliente.nome}</Text>
            </View>
          </View>
          <View style={{ textAlign: "center", minWidth: 160 }}>
            <View style={{ height: 40 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>A Gerência</Text>
              <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 9, textTransform: "uppercase", marginTop: 2 }}>Shark Automotive</Text>
            </View>
          </View>
        </View>

        <Text style={stylesV2.footer}>{LEGAL_FOOTER_V2}</Text>
      </Page>
    </Document>
  )
}
