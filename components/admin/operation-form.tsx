'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2 } from 'lucide-react'
import {
  createClientAccount,
  createOperation,
  uploadOperationPhoto,
  type CreateOperationInput,
} from '@/app/admin/operacoes/actions'
import type { OperationRole } from '@/lib/types'

const inputClass =
  'w-full bg-shark-navy border border-shark-gold/20 rounded-lg px-4 py-3 text-shark-silver placeholder:text-shark-silver/30 focus:outline-none focus:border-shark-gold/50'
const labelClass = 'block text-shark-silver/70 font-mono text-xs uppercase mb-2'

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function OperationForm() {
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
  const [investAmount, setInvestAmount] = useState('')
  const [investDate, setInvestDate] = useState('')
  const [closeDate, setCloseDate] = useState('')

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
                    ? 'bg-shark-gold/20 text-shark-gold'
                    : 'bg-shark-navy-light/50 text-shark-silver/40'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm ${active ? 'text-shark-silver' : 'text-shark-silver/40'}`}>{label}</span>
              {i < stepLabels.length - 1 && <div className="w-8 h-px bg-shark-gold/10" />}
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
            className="flex items-center gap-2 bg-shark-gold text-shark-navy font-medium px-5 py-3 rounded-lg hover:bg-shark-gold-light transition-colors disabled:opacity-50"
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
            <div className="p-4 bg-shark-gold/10 border border-shark-gold/30 rounded-lg">
              <p className="text-shark-gold text-sm font-mono uppercase mb-2">Password temporária (mostrada uma vez)</p>
              <div className="flex items-center gap-3">
                <code className="text-shark-silver bg-shark-navy px-3 py-2 rounded flex-1">{tempPassword}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tempPassword)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="p-2 text-shark-gold hover:text-shark-gold-light"
                  aria-label="Copiar password"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {role !== 'parceiro' ? (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Marca</label><input className={inputClass} value={make} onChange={(e) => setMake(e.target.value)} /></div>
              <div><label className={labelClass}>Modelo</label><input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} /></div>
              <div><label className={labelClass}>Ano</label><input className={inputClass} type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
              <div><label className={labelClass}>Km</label><input className={inputClass} type="number" value={km} onChange={(e) => setKm(e.target.value)} /></div>
              <div><label className={labelClass}>Cor</label><input className={inputClass} value={colour} onChange={(e) => setColour(e.target.value)} /></div>
              <div><label className={labelClass}>Matrícula (opcional)</label><input className={inputClass} value={plate} onChange={(e) => setPlate(e.target.value)} /></div>
              <div><label className={labelClass}>Score Protocolo</label><input className={inputClass} type="number" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="150" /></div>
              <div><label className={labelClass}>Foto</label><input className={inputClass} type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Valor investido (€)</label><input className={inputClass} type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} /></div>
              <div><label className={labelClass}>Data entrada</label><input className={inputClass} type="date" value={investDate} onChange={(e) => setInvestDate(e.target.value)} /></div>
              <div><label className={labelClass}>Data estimada de fecho</label><input className={inputClass} type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} /></div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="bg-shark-gold text-shark-navy font-medium px-5 py-3 rounded-lg hover:bg-shark-gold-light transition-colors">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6 space-y-2 text-shark-silver/80">
            <p><span className="text-shark-silver/50 font-mono text-xs uppercase">Cliente:</span> {fullName} ({email})</p>
            <p><span className="text-shark-silver/50 font-mono text-xs uppercase">Role:</span> {role}</p>
            {role !== 'parceiro' ? (
              <p><span className="text-shark-silver/50 font-mono text-xs uppercase">Viatura:</span> {make} {model} {year}</p>
            ) : (
              <p><span className="text-shark-silver/50 font-mono text-xs uppercase">Investimento:</span> {investAmount ? `${investAmount}€` : '—'}</p>
            )}
            <p className="text-shark-silver/50 text-sm pt-2">Ao criar, os passos do processo serão gerados automaticamente para o role seleccionado.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="border border-shark-gold/20 text-shark-silver px-5 py-3 rounded-lg hover:bg-shark-navy-light/50 transition-colors">
              Voltar
            </button>
            <button
              onClick={handleCreateOperation}
              disabled={loading}
              className="flex items-center gap-2 bg-shark-gold text-shark-navy font-medium px-5 py-3 rounded-lg hover:bg-shark-gold-light transition-colors disabled:opacity-50"
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
