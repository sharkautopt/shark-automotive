'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2, Search } from 'lucide-react'
import {
  createClientAccount,
  createOperation,
  uploadOperationPhoto,
  type CreateOperationInput,
} from '@/app/admin/operacoes/actions'
import type { OperationRole } from '@/lib/types'

const inputClass =
  'w-full bg-background border border-primary/20 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50'
const labelClass = 'block text-muted-foreground/70 font-mono text-xs uppercase mb-2'

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export interface StockVehicleOption {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  price: number | null
  status: 'available' | 'reserved' | 'sold'
  plate: string | null
  colour: string | null
  protocolScore: number | null
  photo: string | null
  hasOperation: boolean
}

function describeStock(v: StockVehicleOption): string {
  return [`${v.make} ${v.model}`, v.year, `${new Intl.NumberFormat('pt-PT').format(v.mileage)} km`, v.plate].filter(Boolean).join(' · ')
}

export function OperationForm({ stockVehicles = [] }: { stockVehicles?: StockVehicleOption[] }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — client
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<OperationRole>('comprador')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Step 2 — details
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')
  const [colour, setColour] = useState('')
  const [plate, setPlate] = useState('')
  const [protocolo, setProtocolo] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  // 'stock' = escolher uma viatura existente; 'manual' = preencher à mão
  const [vehicleMode, setVehicleMode] = useState<'stock' | 'manual'>('stock')
  const [stockSearch, setStockSearch] = useState('')
  const [stockId, setStockId] = useState<string | null>(null)
  const [investAmount, setInvestAmount] = useState('')
  const [investDate, setInvestDate] = useState('')
  const [closeDate, setCloseDate] = useState('')

  const selectedStock = stockVehicles.find((v) => v.id === stockId) ?? null
  const stockMatches = stockVehicles.filter((v) => {
    const q = stockSearch.trim().toLowerCase()
    return !q || `${v.make} ${v.model} ${v.year} ${v.plate ?? ''}`.toLowerCase().includes(q)
  })

  function pickStock(v: StockVehicleOption) {
    setStockId(v.id)
    setMake(v.make)
    setModel(v.model)
    setYear(String(v.year ?? ''))
    setKm(String(v.mileage ?? ''))
    setColour(v.colour ?? '')
    setPlate(v.plate ?? '')
    setProtocolo(v.protocolScore != null ? String(v.protocolScore) : '')
    setPhotoFile(null)
  }

  function switchMode(mode: 'stock' | 'manual') {
    setVehicleMode(mode)
    if (mode === 'manual') setStockId(null)
  }

  async function handleCreateAccount() {
    setError(null)
    if (!fullName.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios')
      return
    }
    setLoading(true)
    const res = await createClientAccount(fullName, email)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setProfileId(res.userId)
    setTempPassword(res.tempPassword)
    setStep(2)
  }

  async function handleCreateOperation() {
    if (!profileId) return
    setError(null)
    setLoading(true)

    let photoUrl: string | undefined
    if (photoFile) {
      const b64 = await fileToBase64(photoFile)
      const up = await uploadOperationPhoto(photoFile.name, b64)
      if (up.ok) photoUrl = up.path
    }

    const input: CreateOperationInput = {
      profileId,
      role,
      vehicle:
        role !== 'parceiro'
          ? {
              make,
              model,
              year: year ? Number(year) : undefined,
              km: km ? Number(km) : undefined,
              colour,
              plate,
              photoUrl,
              protocoloScore: protocolo ? Number(protocolo) : undefined,
              stockVehicleId: vehicleMode === 'stock' && stockId ? stockId : undefined,
            }
          : undefined,
      parceiro:
        role === 'parceiro'
          ? {
              investmentAmount: investAmount ? Number(investAmount) : undefined,
              investmentDate: investDate || undefined,
              estimatedCloseDate: closeDate || undefined,
            }
          : undefined,
    }

    const res = await createOperation(input)
    setLoading(false)
    if (!res.ok) {
      setError(res.error ?? 'Erro ao criar operação')
      return
    }
    router.push(`/admin/operacoes/${res.id}`)
  }

  const stepLabels = ['Cliente', 'Detalhes', 'Confirmar']

  return (
    <div className="max-w-2xl">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => {
          const n = i + 1
          const active = step === n
          const done = step > n
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                  done
                    ? 'bg-green-500/20 text-green-400'
                    : active
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary/50 text-muted-foreground/40'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm ${active ? 'text-foreground' : 'text-muted-foreground/40'}`}>{label}</span>
              {i < stepLabels.length - 1 && <div className="w-8 h-px bg-primary/10" />}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Nome completo</label>
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="João Silva" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as OperationRole)}>
              <option value="comprador">Comprador</option>
              <option value="encomenda">Encomenda</option>
              <option value="parceiro">Parceiro</option>
            </select>
          </div>
          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Continuar
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5">
          {tempPassword && (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-primary text-sm font-mono uppercase mb-2">Password temporária (mostrada uma vez)</p>
              <div className="flex items-center gap-3">
                <code className="text-foreground bg-background px-3 py-2 rounded flex-1">{tempPassword}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tempPassword)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="p-2 text-primary hover:text-primary"
                  aria-label="Copiar password"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {role !== 'parceiro' ? (
            <div className="space-y-5">
              <div className="inline-flex rounded-lg border border-primary/20 overflow-hidden text-sm">
                {(['stock', 'manual'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`px-4 py-2 transition-colors ${
                      vehicleMode === m ? 'bg-primary/20 text-primary' : 'text-muted-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {m === 'stock' ? `Escolher do stock (${stockVehicles.length})` : 'Preencher à mão'}
                  </button>
                ))}
              </div>

              {vehicleMode === 'stock' && (
                <div className="space-y-3">
                  {selectedStock ? (
                    <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      {selectedStock.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedStock.photo} alt="" className="w-20 h-14 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">{describeStock(selectedStock)}</p>
                        <p className="text-muted-foreground/60 text-sm">
                          A ficha completa (VIN, potência, emissões, pesos…) é copiada para a operação ao criar.
                        </p>
                      </div>
                      <button type="button" onClick={() => setStockId(null)} className="text-primary text-sm hover:underline shrink-0">
                        Alterar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        <input
                          className={`${inputClass} pl-10`}
                          value={stockSearch}
                          onChange={(e) => setStockSearch(e.target.value)}
                          placeholder="Pesquisar por marca, modelo, ano ou matrícula"
                        />
                      </div>
                      <ul className="max-h-64 overflow-y-auto border border-primary/10 rounded-lg divide-y divide-primary/5">
                        {stockMatches.length === 0 ? (
                          <li className="p-4 text-center text-muted-foreground/50 text-sm">
                            {stockVehicles.length === 0 ? 'Não há viaturas disponíveis no stock.' : 'Nenhuma viatura corresponde à pesquisa.'}
                          </li>
                        ) : (
                          stockMatches.map((v) => (
                            <li key={v.id}>
                              <button
                                type="button"
                                onClick={() => pickStock(v)}
                                className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/40 transition-colors"
                              >
                                {v.photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={v.photo} alt="" className="w-14 h-10 object-cover rounded shrink-0" />
                                ) : (
                                  <div className="w-14 h-10 rounded bg-secondary/50 shrink-0" />
                                )}
                                <span className="flex-1 min-w-0 text-foreground text-sm truncate">{describeStock(v)}</span>
                                {v.price != null && (
                                  <span className="text-muted-foreground/70 text-sm shrink-0">
                                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v.price)}
                                  </span>
                                )}
                                {v.status === 'reserved' && (
                                  <span className="font-mono text-[10px] uppercase text-amber-400 shrink-0">Reservado</span>
                                )}
                                {v.hasOperation && (
                                  <span className="font-mono text-[10px] uppercase text-amber-400 shrink-0">Já tem operação</span>
                                )}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {(vehicleMode === 'manual' || selectedStock) && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Marca</label><input className={inputClass} value={make} onChange={(e) => setMake(e.target.value)} /></div>
                  <div><label className={labelClass}>Modelo</label><input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} /></div>
                  <div><label className={labelClass}>Ano</label><input className={inputClass} type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
                  <div><label className={labelClass}>Km</label><input className={inputClass} type="number" value={km} onChange={(e) => setKm(e.target.value)} /></div>
                  <div><label className={labelClass}>Cor</label><input className={inputClass} value={colour} onChange={(e) => setColour(e.target.value)} /></div>
                  <div><label className={labelClass}>Matrícula (opcional)</label><input className={inputClass} value={plate} onChange={(e) => setPlate(e.target.value)} /></div>
                  <div><label className={labelClass}>Score Protocolo</label><input className={inputClass} type="number" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="150" /></div>
                  {!selectedStock && (
                    <div><label className={labelClass}>Foto</label><input className={inputClass} type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} /></div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Valor investido (€)</label><input className={inputClass} type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} /></div>
              <div><label className={labelClass}>Data entrada</label><input className={inputClass} type="date" value={investDate} onChange={(e) => setInvestDate(e.target.value)} /></div>
              <div><label className={labelClass}>Data estimada de fecho</label><input className={inputClass} type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} /></div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              disabled={role !== 'parceiro' && vehicleMode === 'stock' && !selectedStock}
              className="bg-primary text-primary-foreground font-medium px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6 space-y-2 text-muted-foreground/80">
            <p><span className="text-muted-foreground/50 font-mono text-xs uppercase">Cliente:</span> {fullName} ({email})</p>
            <p><span className="text-muted-foreground/50 font-mono text-xs uppercase">Role:</span> {role}</p>
            {role !== 'parceiro' ? (
              <p><span className="text-muted-foreground/50 font-mono text-xs uppercase">Viatura{selectedStock ? ' (do stock)' : ''}:</span> {make} {model} {year}</p>
            ) : (
              <p><span className="text-muted-foreground/50 font-mono text-xs uppercase">Investimento:</span> {investAmount ? `${investAmount}€` : '—'}</p>
            )}
            <p className="text-muted-foreground/50 text-sm pt-2">Ao criar, os passos do processo serão gerados automaticamente para o role seleccionado.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="border border-primary/20 text-foreground px-5 py-3 rounded-lg hover:bg-secondary/50 transition-colors">
              Voltar
            </button>
            <button
              onClick={handleCreateOperation}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Operação
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
