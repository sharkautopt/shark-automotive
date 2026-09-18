import { Document, Page, View, Text } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { LEGAL_FOOTER_V2 } from "@/lib/pdf/company"

export interface DeclaracaoCirculacaoProps {
  documentNumber: string
  emittedDate: string
  cliente: { nome: string; nif: string; morada: string }
  viatura: {
    matricula: string
    tipoMatricula: string
    marcaModelo: string
    dataPrimeiraMatricula: string
    dataMatriculaNacional: string
    anoConstrucao: string
    cor: string
    vin: string
    categoria: string
    cilindrada: string
    potencia: string
    combustivel: string
    lotacao: string
    pesoBruto: string
    tara: string
    portas: string
    co2: string
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

export function DeclaracaoCirculacaoDocument({ documentNumber, emittedDate, cliente, viatura }: DeclaracaoCirculacaoProps) {
  return (
    <Document>
      <Page size="A4" style={stylesV2.page}>
        <View style={stylesV2.headerRow}>
          <View>
            <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7, letterSpacing: 2, textTransform: "uppercase", color: brandV2.steel }}>
              Zero conversas · Total transparência
            </Text>
          </View>
          <View style={stylesV2.docMeta}>
            <Text>Declaração N.º {documentNumber}</Text>
            <Text>Emitida em: {emittedDate}</Text>
          </View>
        </View>

        <Text style={stylesV2.title}>Declaração de Circulação</Text>

        <Text style={[stylesV2.bodyText, { marginBottom: 14 }]}>
          Para os devidos efeitos, e em especial para fazer fé perante as Autoridades de Trânsito e Alfandegárias, a
          SHARK AUTOMOTIVE declara que a viatura abaixo identificada foi vendida e começou a circular nesta data, sob
          a responsabilidade do seguinte cliente:
        </Text>

        <Text style={stylesV2.sectionLabel}>Dados do cliente</Text>
        <Field label="Nome completo" value={cliente.nome} />
        <Field label="NIF (contribuinte)" value={cliente.nif} />
        <Field label="Morada completa" value={cliente.morada} />

        <View style={{ marginTop: 12 }}>
          <Text style={stylesV2.sectionLabel}>Características da viatura</Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={{ flex: 1 }}>
              <Field label="Matrícula" value={viatura.matricula} />
              <Field label="Tipo de matrícula" value={viatura.tipoMatricula} />
              <Field label="Marca / Modelo" value={viatura.marcaModelo} />
              <Field label="Data 1.ª matrícula" value={viatura.dataPrimeiraMatricula} />
              <Field label="Data mat. nacional" value={viatura.dataMatriculaNacional} />
              <Field label="Ano de construção" value={viatura.anoConstrucao} />
              <Field label="Cor" value={viatura.cor} />
              <Field label="N.º chassi (VIN)" value={viatura.vin} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Categoria / Tipo" value={viatura.categoria} />
              <Field label="Cilindrada" value={viatura.cilindrada} />
              <Field label="Potência" value={viatura.potencia} />
              <Field label="Combustível" value={viatura.combustivel} />
              <Field label="Lotação" value={viatura.lotacao} />
              <Field label="Peso bruto" value={viatura.pesoBruto} />
              <Field label="Tara" value={viatura.tara} />
              <Field label="Portas" value={viatura.portas} />
              <Field label="CO2" value={viatura.co2} />
            </View>
          </View>
        </View>

        <Text style={[stylesV2.bodyText, { marginTop: 14 }]}>
          Mais declaramos que o referido cliente não se faz acompanhar dos respetivos documentos, por os mesmos se
          encontrarem em regularização junto das Repartições Oficiais (Conservatória do Registo de Automóveis e
          Notariado), situação prevista e autorizada pela Direção-Geral das Contribuições e Impostos, nos termos da
          legislação aplicável em vigor.
        </Text>
        <Text style={[stylesV2.bodyTextBold, { marginTop: 8 }]}>
          Esta declaração é válida por 60 dias úteis a contar da data de emissão.
        </Text>

        <View style={{ marginTop: "auto", paddingTop: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10 }}>Lisboa, {emittedDate}</Text>
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
