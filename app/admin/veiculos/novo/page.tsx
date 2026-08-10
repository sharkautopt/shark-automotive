"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { PhotoUploader } from "@/components/admin/photo-uploader"

export default function NovoVeiculoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    fuel_type: "Gasolina",
    transmission: "Automática",
    power: 0,
    price: 0,
    country_origin: "Alemanha",
    vin: "",
    inspection_status: "pending",
    carpass_status: false,
    protocol_score: 0,
    featured: false,
    status: "available",
    description: "",
    exterior_color: "",
    interior_color: "",
    body_type: "",
    doors: 4,
    seats: 5,
    engine_size: "",
    co2_emissions: 0,
    first_owner: false,
    service_history: true,
    warranty_months: 12,
    financing_available: true,
    photos: [] as string[],
  })

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.user_metadata?.is_admin !== true) {
        router.push("/admin/login")
        return
      }
      setIsAuthorized(true)
    }
    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : type === "number" 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("vehicles").insert([formData])
      if (error) throw error
      router.push("/admin/veiculos")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      console.log("[v0] Erro ao criar veículo:", message, err)
      alert(`Erro ao criar veículo: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/veiculos"
              className="p-2 text-muted-foreground/50 hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-display text-4xl text-foreground">NOVO VEÍCULO</h1>
              <p className="text-muted-foreground/60 mt-1">Adicionar veículo ao inventário</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
              <h2 className="font-display text-2xl text-foreground mb-6">INFORMAÇÕES BÁSICAS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">MARCA *</label>
                  <input type="text" name="make" value={formData.make} onChange={handleChange} required className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="BMW" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">MODELO *</label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="M4 Competition" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">ANO *</label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange} required min={1990} max={2030} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">QUILOMETRAGEM *</label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required min={0} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="15000" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">PREÇO *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min={0} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="89900" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">POTÊNCIA (CV) *</label>
                  <input type="number" name="power" value={formData.power} onChange={handleChange} required min={0} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="510" />
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
              <h2 className="font-display text-2xl text-foreground mb-6">ESPECIFICAÇÕES TÉCNICAS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">COMBUSTÍVEL</label>
                  <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none">
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">TRANSMISSÃO</label>
                  <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none">
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="PDK">PDK</option>
                    <option value="DSG">DSG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">CARROÇARIA</label>
                  <select name="body_type" value={formData.body_type} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none">
                    <option value="">Selecionar</option>
                    <option value="Berlina">Berlina</option>
                    <option value="Carrinha">Carrinha</option>
                    <option value="SUV">SUV</option>
                    <option value="Coupé">Coupé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">ORIGEM</label>
                  <select name="country_origin" value={formData.country_origin} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none">
                    <option value="Alemanha">Alemanha</option>
                    <option value="Bélgica">Bélgica</option>
                    <option value="Holanda">Holanda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">COR EXTERIOR</label>
                  <input type="text" name="exterior_color" value={formData.exterior_color} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="Cinza Metalizado" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">COR INTERIOR</label>
                  <input type="text" name="interior_color" value={formData.interior_color} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="Couro Preto" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">CILINDRADA</label>
                  <input type="text" name="engine_size" value={formData.engine_size} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="3.0L Twin-Turbo" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">VIN</label>
                  <input type="text" name="vin" value={formData.vin} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="WBS43AZ09P1234567" />
                </div>
              </div>
            </div>

            {/* Protocol & Status */}
            <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
              <h2 className="font-display text-2xl text-foreground mb-6">PROTOCOLO & STATUS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">PONTUAÇÃO</label>
                  <input type="number" name="protocol_score" value={formData.protocol_score} onChange={handleChange} min={0} max={150} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">INSPEÇÃO</label>
                  <select name="inspection_status" value={formData.inspection_status} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none">
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Curso</option>
                    <option value="approved">Aprovado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">GARANTIA (MESES)</label>
                  <input type="number" name="warranty_months" value={formData.warranty_months} onChange={handleChange} min={0} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-muted-foreground/70 text-sm font-mono mb-2">STATUS</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none">
                    <option value="available">Disponível</option>
                    <option value="reserved">Reservado</option>
                    <option value="sold">Vendido</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 rounded" />
                  <span className="text-foreground">Destaque</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="carpass_status" checked={formData.carpass_status} onChange={handleChange} className="w-5 h-5 rounded" />
                  <span className="text-foreground">Car-Pass</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="service_history" checked={formData.service_history} onChange={handleChange} className="w-5 h-5 rounded" />
                  <span className="text-foreground">Histórico Serviço</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="financing_available" checked={formData.financing_available} onChange={handleChange} className="w-5 h-5 rounded" />
                  <span className="text-foreground">Financiamento</span>
                </label>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
              <h2 className="font-display text-2xl text-foreground mb-6">FOTOGRAFIAS</h2>
              <PhotoUploader
                photos={formData.photos}
                onChange={(photos) => setFormData((prev) => ({ ...prev, photos }))}
              />
            </div>

            {/* Description */}
            <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
              <h2 className="font-display text-2xl text-foreground mb-6">DESCRIÇÃO</h2>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none resize-none" placeholder="Descrição detalhada do veículo..." />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/admin/veiculos" className="px-6 py-3 text-muted-foreground/70 hover:text-foreground transition-colors">Cancelar</Link>
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-display text-lg rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />A GUARDAR...</> : <><Save className="w-5 h-5" />GUARDAR VEÍCULO</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
