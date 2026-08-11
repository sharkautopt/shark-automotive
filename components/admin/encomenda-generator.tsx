"use client"

import { useMemo, useState } from "react"
import { FileText, Loader2, ExternalLink, Car, User, Euro, Sparkles, ClipboardPaste, ImageIcon } from "lucide-react"
import { serviceFeeForPrice } from "@/lib/pdf/fees"
import { PhotoUploader } from "@/components/admin/photo-uploader"

interface VehicleOption {
  id: string
  make: string
  model: string
  year: number | string
  price: number | null
  mileage: number | null
  fuel_type: string | null
  power: number | null
  exterior_color: string | null
  country_origin: string | null
  transmission: string | null
  photos: string[] | null
}

interface GeneratedDoc {
  id: string
  title: string
  public_url: string
  created_at: string
}

/** Editable vehicle form — all display strings (match EncomendaVehicle). */
interface VehicleForm {
  make: string
  model: string
  variant: string
  year: string
  firstRegistration: string
  mileage: string
  fuel: string
  power: string
  displacement: string
  transmission: string
  drivetrain: string
  doors: string
  seats: string
  bodyType: string
  colour: string
  interior: string
  co2: string
  owners: string
  vin: string
  origin: string
  summary: string
}

const emptyVehicle: VehicleForm = {
  make: "",
  model: "",
  variant: "",
  year: "",
  firstRegistration: "",
  mileage: "",
  fuel: "",
  power: "",
  displacement: "",
  transmission: "",
  drivetrain: "",
  doors: "",
  seats: "",
  bodyType: "",
  colour: "",
  interior: "",
  co2: "",
  owners: "",
  vin: "",
  origin: "",
  summary: "",
}

const num = (n: number) => n.toLocaleString("pt-PT")

export function EncomendaGenerator({ vehicles }: { vehicles: VehicleOption[] }) {
  const [mode, setMode] = useState<"proposta" | "orcamento">("proposta")
  const [clientName, setClientName] = useState("")
  const [vehicleId, setVehicleId] = useState<string>("")
  const [vf, setVf] = useState<VehicleForm>({ ...emptyVehicle })
  const [features, setFeatures] = useState<string>("")
  const [photos, setPhotos] = useState<string[]>([])

  const [pasteText, setPasteText] = useState("")
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseInfo, setParseInfo] = useState<string | null>(null)

  const [fromPrice, setFromPrice] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("4 a 6 semanas")
  const [vehiclePrice, setVehiclePrice] = useState("")
  const [isv, setIsv] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedDoc | null>(null)

  const setField = (k: keyof VehicleForm, v: string) => setVf((prev) => ({ ...prev, [k]: v }))

  // Tiered service fee derived from vehicle price.
  const tier = useMemo(() => serviceFeeForPrice(Number(vehiclePrice) || 0), [vehiclePrice])
  const total = tier.onRequest ? 0 : (Number(vehiclePrice) || 0) + (Number(isv) || 0) + (tier.fee || 0)

  function fillFromStock(id: string) {
    setVehicleId(id)
    const v = vehicles.find((x) => x.id === id)
    if (!v) return
    setVf({
      ...emptyVehicle,
      make: v.make || "",
      model: v.model || "",
      year: String(v.year ?? ""),
      mileage: v.mileage ? `${num(v.mileage)} km` : "",
      fuel: v.fuel_type || "",
      power: v.power ? `${v.power} cv` : "",
      transmission: v.transmission || "",
      colour: v.exterior_color || "",
      origin: v.country_origin || "",
    })
    setPhotos((v.photos || []).slice(0, 5))
    setVehiclePrice(v.price ? String(v.price) : "")
    setFromPrice(v.price ? String(v.price) : "")
  }

  async function analyzePaste() {
    setParseError(null)
    setParseInfo(null)
    if (pasteText.trim().length < 20) {
      setParseError("Cole o texto completo do anúncio.")
      return
    }
    setParsing(true)
    try {
      const res = await fetch("/api/admin/documents/parse-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      })
      const data = await res.json()
      if (!res.ok) {
        setParseError(data.error || "Falha ao analisar o anúncio.")
        return
      }
      const p = data.vehicle
      // External listing: not a stock vehicle.
      setVehicleId("")
      setPhotos([])
      setVf({
        make: p.make || "",
        model: p.model || "",
        variant: p.variant || "",
        year: p.year || "",
        firstRegistration: p.firstRegistration || "",
        mileage: p.mileage != null ? `${num(p.mileage)} km` : "",
        fuel: p.fuel || "",
        power: p.power != null ? `${p.power} cv` : "",
        displacement: p.displacement != null ? `${num(p.displacement)} cm³` : "",
        transmission: p.transmission || "",
        drivetrain: p.drivetrain || "",
        doors: p.doors != null ? String(p.doors) : "",
        seats: p.seats != null ? String(p.seats) : "",
        bodyType: p.bodyType || "",
        colour: p.exteriorColour || "",
        interior: p.interior || "",
        co2: p.co2 != null ? `${p.co2} g/km` : "",
        owners: p.owners != null ? String(p.owners) : "",
        vin: p.vin || "",
        origin: p.sourceHint || "",
        summary: p.summary || "",
      })
      setFeatures((p.features || []).join("\n"))
      if (p.price != null) {
        setVehiclePrice(String(p.price))
        setFromPrice(String(p.price))
      }
      setParseInfo(
        `Anúncio interpretado${p.sourceHint ? ` (${p.sourceHint})` : ""}. Reveja os campos antes de gerar.`,
      )
    } catch {
      setParseError("Erro de rede ao analisar o anúncio.")
    } finally {
      setParsing(false)
    }
  }

  async function generate() {
    setError(null)
    setResult(null)

    if (!clientName.trim()) {
      setError("Indique o nome do cliente.")
      return
    }
    if (!vf.make.trim() || !vf.model.trim()) {
      setError("Indique pelo menos marca e modelo da viatura (selecione uma viatura, cole um anúncio ou preencha manualmente).")
      return
    }
    if (mode === "orcamento" && tier.onRequest) {
      setError("Preço acima de 95.000 € — taxa sob consulta. Ajuste o preço ou gere uma proposta.")
      return
    }

    const vehicle = {
      make: vf.make.trim(),
      model: vf.model.trim(),
      year: vf.year.trim(),
      mileage: vf.mileage.trim() || "—",
      fuel: vf.fuel.trim() || "—",
      power: vf.power.trim() || "—",
      colour: vf.colour.trim() || "—",
      origin: vf.origin.trim() || "—",
      variant: vf.variant.trim() || undefined,
      firstRegistration: vf.firstRegistration.trim() || undefined,
      displacement: vf.displacement.trim() || undefined,
      transmission: vf.transmission.trim() || undefined,
      drivetrain: vf.drivetrain.trim() || undefined,
      doors: vf.doors.trim() || undefined,
      seats: vf.seats.trim() || undefined,
      bodyType: vf.bodyType.trim() || undefined,
      interior: vf.interior.trim() || undefined,
      co2: vf.co2.trim() || undefined,
      owners: vf.owners.trim() || undefined,
      vin: vf.vin.trim() || undefined,
      summary: vf.summary.trim() || undefined,
      features: features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)
        .slice(0, 12),
    }

    const payload: Record<string, unknown> = {
      mode,
      clientName: clientName.trim(),
      vehicleId: vehicleId || undefined,
      vehicle,
      photos: photos.slice(0, 5),
      deliveryTime,
    }

    if (mode === "proposta") {
      payload.fromPrice = Number(fromPrice) || Number(vehiclePrice) || 0
    } else {
      payload.costs = {
        vehiclePrice: Number(vehiclePrice) || 0,
        isv: Number(isv) || 0,
        serviceFee: tier.fee || 0,
        serviceFeeOnRequest: tier.onRequest,
        total,
      }
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/documents/encomenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Falha ao gerar o documento.")
      } else {
        setResult(data)
      }
    } catch {
      setError("Erro de rede ao gerar o documento.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full bg-background border border-primary/20 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
  const smallInput =
    "w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
  const labelClass = "block text-muted-foreground/60 font-mono text-xs uppercase mb-2"
  const smallLabel = "block text-muted-foreground/50 font-mono text-[10px] uppercase mb-1"

  return (
    <div className="max-w-3xl space-y-8">
      {/* Mode toggle */}
      <div className="flex gap-2 bg-secondary/40 p-1.5 rounded-xl border border-primary/10 w-fit">
        {(["proposta", "orcamento"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground/70 hover:text-foreground"
            }`}
          >
            {m === "proposta" ? "Proposta Comercial" : "Orçamento Formal"}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground/60 text-sm -mt-4">
        {mode === "proposta"
          ? "Documento de marketing com valor \u201ca partir de\u201d, ideal para primeiro contacto."
          : "Documento formal numerado (ORC-AAAA-NNN) com discriminação completa de custos e validade de 15 dias."}
      </p>

      {/* Client */}
      <div>
        <label className={labelClass}>
          <User className="w-3 h-3 inline mr-1" />
          Nome do Cliente
        </label>
        <input
          className={inputClass}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ex: João Silva"
        />
      </div>

      {/* AI paste */}
      <div className="border border-primary/20 rounded-xl p-5 bg-secondary/30 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display text-xl text-foreground tracking-wide">ANALISAR ANÚNCIO COM IA</h3>
        </div>
        <p className="text-muted-foreground/50 text-xs -mt-1">
          Cole o texto de uma página de leiloeira, mobile.de, AutoScout24 ou stand (em qualquer idioma). A IA extrai e
          resume os dados da viatura para o documento.
        </p>
        <textarea
          className={`${inputClass} min-h-[120px] resize-y font-mono text-sm`}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Cole aqui o texto completo do anúncio..."
        />
        <div className="flex items-center gap-3">
          <button
            onClick={analyzePaste}
            disabled={parsing}
            className="flex items-center gap-2 bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardPaste className="w-4 h-4" />}
            {parsing ? "A interpretar..." : "Analisar com IA"}
          </button>
          {parseInfo && <span className="text-primary/90 text-xs">{parseInfo}</span>}
          {parseError && <span className="text-red-400 text-xs">{parseError}</span>}
        </div>
      </div>

      {/* Stock vehicle (optional) */}
      <div>
        <label className={labelClass}>
          <Car className="w-3 h-3 inline mr-1" />
          Ou usar viatura em stock
        </label>
        <select className={inputClass} value={vehicleId} onChange={(e) => fillFromStock(e.target.value)}>
          <option value="">Selecionar viatura em stock...</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model} ({v.year})
            </option>
          ))}
        </select>
      </div>

      {/* Editable spec fields */}
      <div className="border border-primary/10 rounded-xl p-5 space-y-4">
        <h3 className="font-display text-xl text-foreground tracking-wide">DADOS DA VIATURA</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Marca *" value={vf.make} onChange={(v) => setField("make", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Modelo *" value={vf.model} onChange={(v) => setField("model", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Versão" value={vf.variant} onChange={(v) => setField("variant", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Ano" value={vf.year} onChange={(v) => setField("year", v)} cls={smallInput} lc={smallLabel} />
          <Field label="1ª Matrícula (MM/AAAA)" value={vf.firstRegistration} onChange={(v) => setField("firstRegistration", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Quilometragem" value={vf.mileage} onChange={(v) => setField("mileage", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Combustível" value={vf.fuel} onChange={(v) => setField("fuel", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Potência" value={vf.power} onChange={(v) => setField("power", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Cilindrada" value={vf.displacement} onChange={(v) => setField("displacement", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Caixa" value={vf.transmission} onChange={(v) => setField("transmission", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Tração" value={vf.drivetrain} onChange={(v) => setField("drivetrain", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Carroçaria" value={vf.bodyType} onChange={(v) => setField("bodyType", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Portas" value={vf.doors} onChange={(v) => setField("doors", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Lugares" value={vf.seats} onChange={(v) => setField("seats", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Cor" value={vf.colour} onChange={(v) => setField("colour", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Interior" value={vf.interior} onChange={(v) => setField("interior", v)} cls={smallInput} lc={smallLabel} />
          <Field label="CO₂" value={vf.co2} onChange={(v) => setField("co2", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Proprietários" value={vf.owners} onChange={(v) => setField("owners", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Origem" value={vf.origin} onChange={(v) => setField("origin", v)} cls={smallInput} lc={smallLabel} />
          <Field label="Chassis (VIN)" value={vf.vin} onChange={(v) => setField("vin", v)} cls={smallInput} lc={smallLabel} />
        </div>
        <div>
          <label className={smallLabel}>Resumo (aparece na proposta)</label>
          <textarea
            className={`${smallInput} min-h-[64px] resize-y`}
            value={vf.summary}
            onChange={(e) => setField("summary", e.target.value)}
            placeholder="Resumo comercial curto do veículo..."
          />
        </div>
        <div>
          <label className={smallLabel}>Equipamento (um item por linha — aparece na proposta)</label>
          <textarea
            className={`${smallInput} min-h-[80px] resize-y`}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder={"Ex:\nBancos em pele\nNavegação\nCâmara de marcha-atrás"}
          />
        </div>
      </div>

      {/* Photos */}
      <div className="border border-primary/10 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="font-display text-xl text-foreground tracking-wide">FOTOGRAFIAS</h3>
        </div>
        <p className="text-muted-foreground/50 text-xs -mt-1">
          Carregue até 5 fotos. A 1ª é a foto grande de destaque; as restantes 4 aparecem no mosaico ao lado. Arraste
          para reordenar ou defina a principal.
        </p>
        <PhotoUploader photos={photos} onChange={(p) => setPhotos(p.slice(0, 5))} />
        {photos.length > 5 && (
          <p className="text-amber-400 text-xs">Apenas as primeiras 5 fotos serão usadas no documento.</p>
        )}
      </div>

      {/* Mode-specific pricing */}
      {mode === "proposta" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              <Euro className="w-3 h-3 inline mr-1" />
              Preço &quot;a partir de&quot;
            </label>
            <input
              type="number"
              className={inputClass}
              value={fromPrice}
              onChange={(e) => setFromPrice(e.target.value)}
              placeholder="Ex: 28900"
            />
          </div>
          <div>
            <label className={labelClass}>Prazo de Entrega</label>
            <input className={inputClass} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Preço da Viatura (€)</label>
              <input
                type="number"
                className={inputClass}
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(e.target.value)}
                placeholder="Ex: 24000"
              />
            </div>
            <div>
              <label className={labelClass}>ISV — introduzido manualmente (€)</label>
              <input
                type="number"
                className={inputClass}
                value={isv}
                onChange={(e) => setIsv(e.target.value)}
                placeholder="Ex: 3200"
              />
            </div>
          </div>

          {/* Auto service fee */}
          <div className="border border-primary/20 rounded-lg px-5 py-4 bg-secondary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground/70 font-mono text-xs uppercase">Taxa de Serviço Shark</p>
                <p className="text-muted-foreground/40 text-[11px] mt-1 max-w-md">
                  Inclui transporte, seguro e todos os encargos documentais e notariais. Determinada pelo escalão de
                  preço {tier.band !== "—" ? `(${tier.band})` : ""}.
                </p>
              </div>
              <span className="text-primary font-display text-2xl whitespace-nowrap">
                {tier.onRequest ? "sob consulta" : tier.fee ? `${num(tier.fee)} €` : "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-secondary/40 border border-primary/20 rounded-lg px-5 py-4">
            <span className="text-muted-foreground/70 font-mono text-sm uppercase">Total Chave-na-Mão</span>
            <span className="text-primary font-display text-3xl">
              {tier.onRequest ? "sob consulta" : `${num(total)} €`}
            </span>
          </div>

          <div>
            <label className={labelClass}>Prazo de Entrega</label>
            <input className={inputClass} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {result && (
        <div className="flex items-center justify-between border border-primary/30 bg-primary/10 rounded-lg px-5 py-4">
          <div>
            <p className="text-foreground font-medium">{result.title}</p>
            <p className="text-muted-foreground/50 text-xs">Documento gerado com sucesso.</p>
          </div>
          <a
            href={result.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary"
          >
            Abrir PDF <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
        {loading ? "A gerar..." : `Gerar ${mode === "proposta" ? "Proposta" : "Orçamento"}`}
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  cls,
  lc,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  cls: string
  lc: string
}) {
  return (
    <div>
      <label className={lc}>{label}</label>
      <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
