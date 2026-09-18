import { Document, Page, View, Text } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { COMPANY_V2, LEGAL_FOOTER_V2 } from "@/lib/pdf/company"

export interface ProcuracaoProps {
  documentNumber: string
  emittedDate: string
  mandante: {
    nomeCompleto: string
    nif: string
    documentoIdentificacao: string
    dataNascimento: string
    morada: string
  }
  viatura: { marcaModelo: string; vin: string; matriculaOrigem: string }
  localData: string
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesV2.fieldRow}>
      <Text style={stylesV2.fieldLabel}>{label}</Text>
      <Text style={stylesV2.fieldValue}>{value || "—"}</Text>
    </View>
  )
}

export function ProcuracaoDocument({ documentNumber, emittedDate, mandante, viatura, localData }: ProcuracaoProps) {
  return (
    <Document>
      <Page size="A4" style={stylesV2.page}>
        <View style={stylesV2.headerRow}>
          <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 8, letterSpacing: 0.5 }}>{COMPANY_V2.brandLine}</Text>
          <View style={stylesV2.docMeta}>
            <Text>Procuração n.º {documentNumber}</Text>
            <Text>Lisboa, {emittedDate}</Text>
          </View>
        </View>

        <Text style={stylesV2.title}>Procuração</Text>
        <Text style={stylesV2.subtitle}>Para efeitos de legalização e registo de veículo automóvel importado</Text>

        <Text style={stylesV2.sectionLabel}>Mandante</Text>
        <View style={{ marginBottom: 12 }}>
          <Field label="Nome completo" value={mandante.nomeCompleto} />
          <Field label="NIF" value={mandante.nif} />
          <Field label="Documento de identificação e validade" value={mandante.documentoIdentificacao} />
          <Field label="Data de nascimento" value={mandante.dataNascimento} />
          <Field label="Morada completa" value={mandante.morada} />
        </View>

        <Text style={stylesV2.sectionLabel}>Veículo</Text>
        <View style={{ marginBottom: 12 }}>
          <Field label="Marca e modelo" value={viatura.marcaModelo} />
          <Field label="N.º de quadro (VIN)" value={viatura.vin} />
          <Field label="Matrícula de origem" value={viatura.matriculaOrigem} />
        </View>

        <Text style={stylesV2.sectionLabel}>Mandato</Text>
        <Text style={[stylesV2.bodyText, { marginBottom: 8 }]}>
          Por este instrumento, o mandante acima identificado constitui sua bastante procuradora a sociedade{" "}
          {COMPANY_V2.legalName}, com a marca comercial Shark Automotive, com sede na {COMPANY_V2.address}, titular
          do número de identificação de pessoa colectiva {COMPANY_V2.nif}, a quem confere poderes para, em seu nome
          e representação, praticar todos os actos necessários à legalização e ao registo do veículo automóvel supra
          identificado.
        </Text>
        <Text style={[stylesV2.bodyText, { marginBottom: 8 }]}>
          Compreendem-se nos poderes conferidos, designadamente: apresentar a Declaração Aduaneira de Veículo e
          requerer a liquidação do Imposto Sobre Veículos junto da Autoridade Tributária e Aduaneira; requerer a
          homologação técnica, a inspecção para atribuição de matrícula e a atribuição de matrícula nacional junto do
          Instituto da Mobilidade e dos Transportes; requerer o registo inicial de propriedade junto da Conservatória
          do Registo Automóvel; assinar, receber e apresentar quaisquer requerimentos, declarações, formulários e
          documentos junto das referidas entidades; pagar taxas, emolumentos e impostos devidos; e levantar e
          receber a documentação emitida, incluindo o Documento Único Automóvel e o certificado de matrícula.
        </Text>
        <Text style={stylesV2.bodyText}>
          O presente mandato é conferido a título gratuito, com a faculdade de substituição, e caduca com a
          conclusão do processo de legalização e a entrega da documentação final ao mandante, ou por revogação
          expressa comunicada por escrito.
        </Text>

        <View style={{ marginTop: 30 }} wrap={false}>
          <Text style={{ fontSize: 10, marginBottom: 30 }}>{localData}</Text>

          <Text style={stylesV2.sectionLabel}>Reconhecimento de assinatura</Text>
          <Text style={[stylesV2.bodyText, { color: brandV2.steel, marginBottom: 24 }]}>A preencher pela entidade competente</Text>

          <View style={{ minWidth: 240 }}>
            <View style={{ height: 30 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>O Mandante</Text>
              <Text style={{ fontSize: 7, color: brandV2.steel, marginTop: 2 }}>Assinatura conforme documento de identificação</Text>
            </View>
          </View>
        </View>

        <Text style={stylesV2.footer}>{LEGAL_FOOTER_V2}</Text>
      </Page>
    </Document>
  )
}
