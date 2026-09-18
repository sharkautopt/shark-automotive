import { Document, Page, View, Text } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { LEGAL_FOOTER_V2 } from "@/lib/pdf/company"
import { WARRANTY_TERM } from "@/lib/warranty"

const CHECKLIST_ITEMS = [
  "Documento Único Automóvel",
  "Certificado de matrícula",
  "Livro de revisões e histórico de manutenção",
  "Manual de instruções",
  "Comprovativo de inspecção periódica",
  "Triângulo e colete reflector",
  "Kit de emergência / roda sobressalente",
  "Declaração aduaneira de veículo",
]

export interface DeclaracaoEntregaProps {
  documentNumber: string
  emittedDate: string
  veiculo: { marcaModelo: string; matricula: string }
  entrega: {
    quilometragem: string
    localData: string
    chavesEntregues: string
    nivelCombustivel: string
    observacoes: string
    /** Which of CHECKLIST_ITEMS were actually handed over — defaults to all. */
    checklist: boolean[]
  }
  clienteNome: string
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesV2.fieldRow}>
      <Text style={stylesV2.fieldLabel}>{label}</Text>
      <Text style={stylesV2.fieldValue}>{value || "—"}</Text>
    </View>
  )
}

export function DeclaracaoEntregaDocument({ documentNumber, emittedDate, veiculo, entrega, clienteNome }: DeclaracaoEntregaProps) {
  return (
    <Document>
      <Page size="A4" style={stylesV2.page}>
        <View style={stylesV2.headerRow}>
          <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7, letterSpacing: 2, textTransform: "uppercase", color: brandV2.steel }}>
            Zero conversas · Total transparência
          </Text>
          <View style={stylesV2.docMeta}>
            <Text>Declaração n.º {documentNumber}</Text>
            <Text>Lisboa, {emittedDate}</Text>
          </View>
        </View>

        <Text style={stylesV2.title}>Declaração de Entrega</Text>
        <Text style={stylesV2.subtitle}>Auto de entrega e recepção de veículo automóvel</Text>

        <Text style={stylesV2.sectionLabel}>Veículo entregue</Text>
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Marca e modelo" value={veiculo.marcaModelo} />
            <Field label="Matrícula" value={veiculo.matricula} />
            <Field label="Quilometragem à entrega" value={entrega.quilometragem} />
            <Field label="Local e data da entrega" value={entrega.localData} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Chaves entregues" value={entrega.chavesEntregues} />
            <Field label="Nível de combustível" value={entrega.nivelCombustivel} />
          </View>
        </View>

        <Text style={stylesV2.sectionLabel}>Documentação e acessórios entregues</Text>
        <View style={{ marginBottom: 12 }}>
          {CHECKLIST_ITEMS.map((item, i) => (
            <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Text style={{ fontFamily: "Inter", fontSize: 8, color: entrega.checklist[i] ? brandV2.accent : brandV2.steelLight }}>
                {entrega.checklist[i] ? "[x]" : "[ ]"}
              </Text>
              <Text style={{ fontSize: 8.5 }}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={[stylesV2.fieldLabel, { width: "auto", marginBottom: 2 }]}>Observações ao estado do veículo</Text>
        <Text style={[stylesV2.bodyText, { marginBottom: 14 }]}>{entrega.observacoes || "Sem observações."}</Text>

        <Text style={stylesV2.bodyText}>
          O cliente declara receber o veículo acima identificado, no estado descrito, conferindo a documentação e os
          acessórios assinalados, e confirmando que a quilometragem registada corresponde à verificada no momento da
          entrega. Declara igualmente ter-lhe sido dada oportunidade de examinar a viatura e de esclarecer todas as
          questões relativas ao seu estado e histórico. A garantia contratada de {WARRANTY_TERM} conta-se a partir da
          data da presente declaração.
        </Text>

        <View style={{ marginTop: 30, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ textAlign: "center", minWidth: 160 }}>
            <View style={{ height: 40 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>Entregue por</Text>
              <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 9, textTransform: "uppercase", marginTop: 2 }}>Shark Automotive</Text>
            </View>
          </View>
          <View style={{ textAlign: "center", minWidth: 160 }}>
            <View style={{ height: 40 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>Recebido por</Text>
              <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 9, textTransform: "uppercase", marginTop: 2 }}>{clienteNome}</Text>
            </View>
          </View>
        </View>

        <Text style={stylesV2.footer}>{LEGAL_FOOTER_V2}</Text>
      </Page>
    </Document>
  )
}

export { CHECKLIST_ITEMS }
