"use client"

import { useState } from "react"
import { Loader2, AlertCircle, Copy, Edit2, Search } from "lucide-react"
import { ImportCosts } from "@/lib/import/calculate-costs"
import { calculateISV, normalizeFuelCategory, type Norma } from "@/lib/import/calculate-isv"
import { SimulatorCostBreakdown } from "./simulator-cost-breakdown"
import { SimulatorInquiryModal } from "./simulator-inquiry-modal"

interface VehicleData {
  make?: string
  model?: string
  year?: number
  mileage?: number
  price?: number
  fuelType?: string
  power?: number
  transmission?: string
  bodyType?: string
  co2?: number
  cc?: number
}

export function SimulatorForm() {
  const [mode, setMode] = useState<"url" | "ai" | "manual">("ai")
  const [url, setUrl] = useState("")
  const [listingText, setListingText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [costs, setCosts] = useState<ImportCosts | null>(null)
  const [overrideIsv, setOverrideIsv] = useState(false)
  const [customIsv, setCustomIsv] = useState("")
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [norma, setNorma] = useState<Norma | "">("")
  const [particulatesConfirmed, setParticulatesConfirmed] = useState(false)

  const [manualData, setManualData] = useState<VehicleData>({
    make: "",
    model: "",
    year: undefined,
    mileage: undefined,
    price: undefined,
    fuelType: "",
    power: undefined,
    transmission: "",
    bodyType: "",
    co2: undefined,
    cc: undefined,
  })

  async function handleParseUrl() {
    if (!url.trim()) {
      setError("Por favor, cola um URL válido")
      return
    }

    setLoading(true)
    setError("")
    setVehicleData(null)
    setCosts(null)

    try {
      const res = await fetch("/api/import/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao processar URL")
      }

      const data = (await res.json()) as VehicleData
      setVehicleData(data)
      setNorma("")
      setParticulatesConfirmed(false)

      // ISV requires the Norma de homologação (NEDC/WLTP) — an explicit user choice, never inferred.
      // Costs are shown once the user selects it below; until then ISV is treated as 0.
      if (data.price) {
        await calculateCosts(data.price, 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasteText() {
    if (!listingText.trim()) {
      setError("Por favor, cola o texto do anúncio")
      return
    }

    setLoading(true)
    setError("")
    setVehicleData(null)
    setCosts(null)

    try {
      const res = await fetch("/api/import/parse-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: listingText.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao processar texto")
      }

      const response = await res.json()
      const parsedVehicle = response.vehicle

      // Map ParsedVehicle to VehicleData for the simulator
      const vehicleData: VehicleData = {
        make: parsedVehicle.make,
        model: parsedVehicle.model,
        year: parsedVehicle.year ? parseInt(parsedVehicle.year) : undefined,
        mileage: parsedVehicle.mileage,
        price: parsedVehicle.price || undefined,
        fuelType: parsedVehicle.fuel,
        power: parsedVehicle.power,
        transmission: parsedVehicle.transmission,
        bodyType: parsedVehicle.bodyType,
        co2: parsedVehicle.co2,
        cc: parsedVehicle.displacement,
      }

      setVehicleData(vehicleData)
      setNorma("")
      setParticulatesConfirmed(false)

      // ISV requires the Norma de homologação (NEDC/WLTP) — an explicit user choice, never inferred.
      if (vehicleData.price) {
        await calculateCosts(vehicleData.price, 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  async function calculateCosts(price: number, isv: number) {
    try {
      const res = await fetch("/api/import/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehiclePrice: price, isv }),
      })

      if (!res.ok) throw new Error("Erro ao calcular custos")

      const data = (await res.json()) as ImportCosts
      setCosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular custos")
    }
  }

  async function handleIsvChange(value: string) {
    setCustomIsv(value)
    if (vehicleData?.price && value) {
      const isvAmount = parseFloat(value) || 0
      await calculateCosts(vehicleData.price, isvAmount)
    }
  }

  /** Recomputes ISV (requires an explicit Norma) and the full cost breakdown. */
  async function recalcWithNorma(normaValue: Norma | "", particulates: boolean) {
    if (!vehicleData?.price) return
    if (!normaValue) {
      await calculateCosts(vehicleData.price, 0)
      return
    }
    const fuel = normalizeFuelCategory(vehicleData.fuelType)
    const isvAmount = calculateISV({
      fuel,
      cc: vehicleData.cc,
      co2: vehicleData.co2,
      norma: normaValue,
      registrationYear: vehicleData.year,
      particulatesConfirmed: fuel === "gasoleo" && particulates,
    })
    await calculateCosts(vehicleData.price, isvAmount)
  }

  async function handleNormaChange(value: Norma | "") {
    setNorma(value)
    await recalcWithNorma(value, particulatesConfirmed)
  }

  async function handleParticulatesChange(checked: boolean) {
    setParticulatesConfirmed(checked)
    await recalcWithNorma(norma, checked)
  }

  async function handleManualSubmit() {
    if (!manualData.price || !manualData.make || !manualData.model) {
      setError("Por favor, preencha pelo menos marca, modelo e preço")
      return
    }

    setError("")
    setVehicleData(manualData)
    setNorma("")
    setParticulatesConfirmed(false)

    // ISV requires the Norma de homologação (NEDC/WLTP) — selected below, once vehicle data is shown.
    if (manualData.price) {
      await calculateCosts(manualData.price, 0)
    }
  }

  function handleManualChange(field: keyof VehicleData, value: string | number | undefined) {
    setManualData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="border border-shark-gold/10 rounded-xl p-6 space-y-4">
        <h2 className="font-bebas text-2xl text-shark-silver tracking-wide">SIMULADOR DE IMPORTAÇÃO</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-shark-gold/10 -mx-6 px-6 overflow-x-auto">
          <button
            onClick={() => {
              setMode("url")
              setError("")
            }}
            className={`pb-3 px-4 font-mono text-sm font-semibold tracking-wider transition-colors whitespace-nowrap ${
              mode === "url"
                ? "text-shark-gold border-b-2 border-shark-gold"
                : "text-shark-silver/50 hover:text-shark-silver/70"
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            URL
          </button>
          <button
            onClick={() => {
              setMode("ai")
              setError("")
            }}
            className={`pb-3 px-4 font-mono text-sm font-semibold tracking-wider transition-colors whitespace-nowrap ${
              mode === "ai"
                ? "text-shark-gold border-b-2 border-shark-gold"
                : "text-shark-silver/50 hover:text-shark-silver/70"
            }`}
          >
            <Copy className="w-4 h-4 inline mr-2" />
            IA (Cole Texto)
          </button>
          <button
            onClick={() => {
              setMode("manual")
              setError("")
            }}
            className={`pb-3 px-4 font-mono text-sm font-semibold tracking-wider transition-colors whitespace-nowrap ${
              mode === "manual"
                ? "text-shark-gold border-b-2 border-shark-gold"
                : "text-shark-silver/50 hover:text-shark-silver/70"
            }`}
          >
            <Edit2 className="w-4 h-4 inline mr-2" />
            Manual
          </button>
        </div>

        {/* URL Mode */}
        {mode === "url" && (
          <div className="space-y-4">
            <p className="text-sm text-shark-silver/60">
              Cola o URL de um anúncio de carro (Mobile.de, AutoScout24, Coches.net, etc.)
            </p>
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://www.mobile.de/auto/... ou https://www.autoscout24.com/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleParseUrl()}
                className="flex-1 bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
                disabled={loading}
              />
              <button
                onClick={handleParseUrl}
                disabled={loading}
                className="flex items-center gap-2 bg-shark-gold hover:bg-shark-gold-light text-shark-navy disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-mono text-sm font-semibold tracking-wider transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analisar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI (Paste Text) Mode */}
        {mode === "ai" && (
          <div className="space-y-4">
            <div className="bg-shark-gold/5 border border-shark-gold/20 rounded-lg p-3 space-y-2">
              <p className="text-sm text-shark-silver/70 font-semibold">🤖 Extração Automática com IA:</p>
              <ol className="text-xs text-shark-silver/60 space-y-1 ml-4 list-decimal">
                <li>Abra o anúncio do carro no browser (Mobile.de, AutoScout24, Coches.net, etc.)</li>
                <li>Selecione e copie todo o texto (Ctrl+A, Ctrl+C)</li>
                <li>Cola aqui e clique "Analisar" — a IA extrai os dados automaticamente</li>
              </ol>
            </div>
            <textarea
              placeholder="Cola aqui o texto completo do anúncio de carro..."
              value={listingText}
              onChange={(e) => {
                setListingText(e.target.value)
                setError("")
              }}
              rows={6}
              className="w-full bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors resize-none"
              disabled={loading}
            />
            <button
              onClick={handlePasteText}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-shark-gold hover:bg-shark-gold-light text-shark-navy disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-mono text-sm font-semibold tracking-wider transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extraindo com IA...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Extrair Dados
                </>
              )}
            </button>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="space-y-4">
            <p className="text-sm text-shark-silver/60">Preencha os dados do carro para obter o orçamento completo.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Marca (ex: BMW)"
            value={manualData.make || ""}
            onChange={(e) => handleManualChange("make", e.target.value)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="text"
            placeholder="Modelo (ex: 320d)"
            value={manualData.model || ""}
            onChange={(e) => handleManualChange("model", e.target.value)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Ano"
            value={manualData.year || ""}
            onChange={(e) => handleManualChange("year", e.target.value ? parseInt(e.target.value) : undefined)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Quilometragem (km)"
            value={manualData.mileage || ""}
            onChange={(e) =>
              handleManualChange("mileage", e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Preço (EUR)"
            value={manualData.price || ""}
            onChange={(e) => handleManualChange("price", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="text"
            placeholder="Combustível (ex: Diesel)"
            value={manualData.fuelType || ""}
            onChange={(e) => handleManualChange("fuelType", e.target.value)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Potência (cv)"
            value={manualData.power || ""}
            onChange={(e) =>
              handleManualChange("power", e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="text"
            placeholder="Caixa de velocidades"
            value={manualData.transmission || ""}
            onChange={(e) => handleManualChange("transmission", e.target.value)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Cilindrada (cc)"
            value={manualData.cc || ""}
            onChange={(e) => handleManualChange("cc", e.target.value ? parseInt(e.target.value) : undefined)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Emissões CO₂ (g/km)"
            value={manualData.co2 || ""}
            onChange={(e) => handleManualChange("co2", e.target.value ? parseInt(e.target.value) : undefined)}
            className="bg-shark-navy-light border border-shark-gold/10 rounded-lg px-4 py-3 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
          />
        </div>
        <p className="text-xs text-shark-silver/50">
          Cilindrada e CO₂ são necessários para calcular o ISV. Pode ainda selecionar a Norma de homologação
          após submeter os dados.
        </p>

        <button
          onClick={handleManualSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-shark-gold hover:bg-shark-gold-light text-shark-navy disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-mono text-sm font-semibold tracking-wider transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Calcular Orçamento
            </>
          )}
        </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Vehicle Data Section */}
      {vehicleData && (
        <div className="border border-shark-gold/10 rounded-xl p-6 space-y-4">
          <h3 className="font-bebas text-xl text-shark-silver tracking-wide">DADOS INSERIDOS</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicleData.make && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">MARCA</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.make}</p>
              </div>
            )}
            {vehicleData.model && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">MODELO</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.model}</p>
              </div>
            )}
            {vehicleData.year && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">ANO</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.year}</p>
              </div>
            )}
            {vehicleData.mileage && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">QUILOMETRAGEM</p>
                <p className="text-sm font-mono text-shark-silver">
                  {vehicleData.mileage.toLocaleString("pt-PT")} km
                </p>
              </div>
            )}
            {vehicleData.price && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">PREÇO DO CARRO</p>
                <p className="text-sm font-mono text-shark-gold font-semibold">
                  {vehicleData.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                </p>
              </div>
            )}
            {vehicleData.fuelType && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">COMBUSTÍVEL</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.fuelType}</p>
              </div>
            )}
            {vehicleData.power && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">POTÊNCIA</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.power} cv</p>
              </div>
            )}
            {vehicleData.transmission && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">CAIXA</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.transmission}</p>
              </div>
            )}
            {vehicleData.bodyType && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">CARROÇARIA</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.bodyType}</p>
              </div>
            )}
            {vehicleData.co2 && (
              <div>
                <p className="text-xs text-shark-silver/50 font-mono tracking-widest mb-1">EMISSÕES CO₂</p>
                <p className="text-sm font-mono text-shark-silver">{vehicleData.co2} g/km</p>
              </div>
            )}
          </div>

          {/* ISV Override */}
          <div className="border-t border-shark-gold/10 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideIsv}
                onChange={(e) => {
                  setOverrideIsv(e.target.checked)
                  if (!e.target.checked) {
                    setCustomIsv("")
                    if (vehicleData.price) calculateCosts(vehicleData.price, 0)
                  }
                }}
                className="w-4 h-4 accent-shark-gold"
              />
              <span className="text-sm text-shark-silver/70">Adicionar ISV manual (opcional)</span>
            </label>

            {overrideIsv && (
              <input
                type="number"
                placeholder="Valor ISV em EUR"
                value={customIsv}
                onChange={(e) => handleIsvChange(e.target.value)}
                className="mt-2 w-full bg-shark-navy-light border border-shark-gold/10 rounded-lg px-3 py-2 text-shark-silver placeholder-shark-silver/30 font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
              />
            )}

            {!overrideIsv && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-sm text-shark-silver/70 mb-1">
                    Norma de homologação <span className="text-shark-gold">*</span>
                  </label>
                  <select
                    value={norma}
                    onChange={(e) => handleNormaChange(e.target.value as Norma | "")}
                    className="w-full bg-shark-navy-light border border-shark-gold/10 rounded-lg px-3 py-2 text-shark-silver font-mono text-sm focus:outline-none focus:border-shark-gold/30 focus:ring-1 focus:ring-shark-gold/20 transition-colors"
                  >
                    <option value="">Selecione NEDC ou WLTP…</option>
                    <option value="NEDC">NEDC</option>
                    <option value="WLTP">WLTP</option>
                  </select>
                  <p className="text-xs text-shark-silver/40 mt-1">
                    Necessária para calcular o ISV — consulte o Certificado de Conformidade (CoC) ou DUA do
                    veículo. Nunca é adivinhada a partir do ano.
                  </p>
                </div>

                {normalizeFuelCategory(vehicleData.fuelType) === "gasoleo" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={particulatesConfirmed}
                      onChange={(e) => handleParticulatesChange(e.target.checked)}
                      className="w-4 h-4 accent-shark-gold"
                    />
                    <span className="text-sm text-shark-silver/70">
                      Confirmo emissão de partículas ≥0,001g/km (+500 €)
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <SimulatorCostBreakdown costs={costs} loading={loading && !vehicleData} />

      {/* CTA Button */}
      {costs && (
        <div className="mt-6">
          <button
            onClick={() => setShowInquiryModal(true)}
            className="w-full bg-shark-gold hover:bg-shark-gold-light text-shark-navy px-6 py-4 rounded-lg font-bebas text-lg tracking-wider transition-colors"
          >
            QUERO RECEBER PROPOSTA
          </button>
        </div>
      )}

      {/* Inquiry Modal */}
      <SimulatorInquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        vehicleData={vehicleData}
        estimatedCost={costs?.total}
      />
    </div>
  )
}
