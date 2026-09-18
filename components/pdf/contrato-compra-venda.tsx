import { Document, Page, View, Text } from "@react-pdf/renderer"
import { stylesV2, brandV2 } from "@/lib/pdf/theme-v2"
import { COMPANY_V2, LEGAL_FOOTER_V2 } from "@/lib/pdf/company"

export interface ContratoCompraVendaProps {
  documentNumber: string
  emittedDate: string
  comprador: { nome: string; nif: string; idDocumento: string; morada: string }
  viatura: { marca: string; modelo: string; ano: string; vin: string; cilindrada: string; matricula: string; km: string }
  precoTotal: string
  precoTotalExtenso: string
  precoVeiculo: string
  isv: string
  taxaServico: string
  sinalPago: string
  remanescente: string
  iban: string
}

function Clause({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
        Cláusula {number} · {title}
      </Text>
      <Text style={stylesV2.bodyText}>{children}</Text>
    </View>
  )
}

export function ContratoCompraVendaDocument(props: ContratoCompraVendaProps) {
  const { documentNumber, emittedDate, comprador, viatura, precoTotal, precoTotalExtenso, precoVeiculo, isv, taxaServico, sinalPago, remanescente, iban } = props

  return (
    <Document>
      <Page size="A4" style={stylesV2.page}>
        <View style={stylesV2.headerRow}>
          <Text style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 8, letterSpacing: 0.5 }}>{COMPANY_V2.brandLine}</Text>
          <View style={stylesV2.docMeta}>
            <Text>Contrato n.º {documentNumber}</Text>
            <Text>Lisboa, {emittedDate}</Text>
          </View>
        </View>

        <Text style={stylesV2.title}>Contrato de Compra e Venda de Veículo Automóvel</Text>
        <Text style={stylesV2.subtitle}>Entre as partes abaixo identificadas</Text>

        <Text style={stylesV2.sectionLabel}>Partes</Text>
        <Text style={[stylesV2.bodyText, { marginBottom: 8 }]}>
          <Text style={stylesV2.bodyTextBold}>Primeiro Outorgante (Vendedor):</Text> {COMPANY_V2.legalName}, sociedade
          comercial por quotas com a marca comercial Shark Automotive, com sede na {COMPANY_V2.address}, titular do
          número de identificação de pessoa colectiva {COMPANY_V2.nif}, com o capital social de{" "}
          {COMPANY_V2.capitalSocial}, neste acto representada pela sua Gerência.
        </Text>
        <Text style={[stylesV2.bodyText, { marginBottom: 14 }]}>
          <Text style={stylesV2.bodyTextBold}>Segundo Outorgante (Comprador):</Text> {comprador.nome}, titular do número
          de identificação fiscal {comprador.nif} e do documento de identificação n.º {comprador.idDocumento},
          residente em {comprador.morada}.
        </Text>

        <Clause number="Primeira" title="Objecto">
          O Primeiro Outorgante vende ao Segundo Outorgante, que compra, o veículo automóvel de marca {viatura.marca},
          modelo {viatura.modelo}, do ano de {viatura.ano}, com o número de quadro (VIN) {viatura.vin}, cilindrada de{" "}
          {viatura.cilindrada}, matrícula {viatura.matricula}, com {viatura.km} quilómetros à data da celebração do
          presente contrato.
        </Clause>

        <Clause number="Segunda" title="Preço e Pagamento">
          O custo total da operação é de {precoTotal} ({precoTotalExtenso}), repartido do seguinte modo:{" "}
          {precoVeiculo} referentes ao preço do veículo, pagos pelo Segundo Outorgante directamente ao vendedor na
          origem, contra factura emitida em seu nome; {isv} referentes ao Imposto Sobre Veículos, pagos pelo Segundo
          Outorgante directamente à Autoridade Tributária e Aduaneira, através de referência Multibanco emitida por
          aquela entidade; e {taxaServico} referentes à taxa de serviço devida ao Primeiro Outorgante. Deste último
          valor, o Segundo Outorgante entregou já, a título de sinal e princípio de pagamento, a quantia de{" "}
          {sinalPago}, de que o Primeiro Outorgante dá quitação, sendo o remanescente de {remanescente} pago por
          transferência bancária para o IBAN {iban} até ao momento da entrega da viatura.
        </Clause>

        <Clause number="Terceira" title="Estado do Veículo e Garantia">
          O Segundo Outorgante declara ter examinado o veículo, conhecer o seu estado de conservação e o respectivo
          histórico, e aceitá-lo nas condições em que se encontra. Tratando-se de venda de bem de consumo usado, as
          partes acordam expressamente, nos termos legalmente admissíveis, em fixar o prazo de garantia em 18
          (dezoito) meses por mútuo acordo, contados da data de entrega, abrangendo defeitos de conformidade não
          decorrentes de desgaste normal, de utilização indevida ou de falta de manutenção.
        </Clause>

        <Clause number="Quarta" title="Transmissão da Propriedade e Registo">
          A propriedade transmite-se com a entrega do veículo e a boa liquidação integral do preço. O Primeiro
          Outorgante entrega ao Segundo Outorgante toda a documentação necessária ao registo e obriga-se a promover,
          ou a facultar os meios para, o registo de propriedade em nome do Segundo Outorgante junto da Conservatória
          do Registo Automóvel. A partir da entrega, correm por conta do Segundo Outorgante o Imposto Único de
          Circulação, o seguro obrigatório e a inspecção periódica.
        </Clause>

        <Text style={stylesV2.bodyText}>
          O presente contrato é feito em duplicado, ficando um exemplar na posse de cada um dos Outorgantes, que o
          assinam por estarem de pleno acordo com o seu conteúdo.
        </Text>

        <View style={{ marginTop: 30, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ textAlign: "center", minWidth: 160 }}>
            <View style={{ height: 40 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>O Primeiro Outorgante</Text>
              <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 9, textTransform: "uppercase", marginTop: 2 }}>Shark Automotive</Text>
            </View>
          </View>
          <View style={{ textAlign: "center", minWidth: 160 }}>
            <View style={{ height: 40 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: brandV2.steelLight, paddingTop: 4 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 7.5 }}>O Segundo Outorgante</Text>
              <Text style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 9, textTransform: "uppercase", marginTop: 2 }}>{comprador.nome}</Text>
            </View>
          </View>
        </View>

        <Text style={stylesV2.footer}>{LEGAL_FOOTER_V2}</Text>
      </Page>
    </Document>
  )
}
