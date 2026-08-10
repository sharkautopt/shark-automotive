import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { SimulatorForm } from "@/components/import/simulator-form"

export const metadata: Metadata = {
  title: "Simulador de Importação | Shark Automotive",
  description: "Simula o custo completo de importar um carro: preço, ISV, taxa de serviço, transport, seguro e encargos documentais.",
}

export default function SimulatorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Hero */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="font-bebas text-4xl md:text-5xl text-shark-silver tracking-wider mb-4">
            SIMULADOR DE IMPORTAÇÃO
          </h1>
          <p className="text-shark-silver/70 leading-relaxed">
            Quer saber quanto custa importar um carro específico? Cola o link do anúncio (Mobile.de, AutoScout24,
            Coches.net) e recebe um orçamento completo, com ISV, taxa de serviço, transporte, seguro e encargos
            documentais.
          </p>
        </div>

        {/* Simulator */}
        <SimulatorForm />

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16 space-y-6">
          <h2 className="font-bebas text-2xl text-shark-silver tracking-wider mb-6">PERGUNTAS FREQUENTES</h2>

          <div className="space-y-4">
            <div className="border border-shark-gold/10 rounded-lg p-5">
              <h3 className="font-bebas text-lg text-shark-gold mb-2 tracking-wide">
                Como funciona o simulador?
              </h3>
              <p className="text-sm text-shark-silver/70 leading-relaxed">
                Cola o URL do carro que pretende importar. O nosso sistema analisa a página e extrai os dados
                técnicos (marca, modelo, ano, quilometragem, preço, etc.). De seguida, calcula automaticamente o ISV
                português e o custo total com transporte, seguro e encargos.
              </p>
            </div>

            <div className="border border-shark-gold/10 rounded-lg p-5">
              <h3 className="font-bebas text-lg text-shark-gold mb-2 tracking-wide">
                O ISV é sempre correto?
              </h3>
              <p className="text-sm text-shark-silver/70 leading-relaxed">
                O ISV é calculado com base em dados públicos e fórmulas oficiais, mas pode variar ligeiramente
                dependendo de fatores específicos (tipo de combustível, emissões, condição do veículo). O nosso
                orçamento é estimado. Para um valor oficial, contacte as autoridades aduaneiras.
              </p>
            </div>

            <div className="border border-shark-gold/10 rounded-lg p-5">
              <h3 className="font-bebas text-lg text-shark-gold mb-2 tracking-wide">
                A taxa de serviço está incluída?
              </h3>
              <p className="text-sm text-shark-silver/70 leading-relaxed">
                Sim. A taxa de serviço Shark inclui transporte, seguro internacional, matriculação em Portugal,
                documentação notarial e todos os encargos administrativos necessários. Sem surpresas.
              </p>
            </div>

            <div className="border border-shark-gold/10 rounded-lg p-5">
              <h3 className="font-bebas text-lg text-shark-gold mb-2 tracking-wide">
                Quais as fontes suportadas?
              </h3>
              <p className="text-sm text-shark-silver/70 leading-relaxed">
                O simulador funciona com qualquer URL de site de anúncios (Mobile.de, AutoScout24, Coches.net,
                StandVirtual, OLX, Leiloeira, etc.). Cola o link direto do anúncio e pronto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
