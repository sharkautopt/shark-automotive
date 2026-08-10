'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { PhotoUploader } from '@/components/admin/photo-uploader'
import { PhotoAnalysisPanel } from '@/components/admin/photo-analysis-panel'
import { VehicleDocuments } from '@/components/admin/vehicle-documents'
import type { Vehicle } from '@/lib/types'

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuthAndFetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.user_metadata?.is_admin !== true) {
        router.push('/admin/login')
        return
      }
      setIsAuthorized(true)

      const { data, error } = await supabase.from('vehicles').select('*').eq('id', params.id).single()
      if (error) {
        console.error('Error fetching vehicle:', error)
        router.push('/admin/veiculos')
        return
      }
      setVehicle(data)
      setLoading(false)
    }
    checkAuthAndFetch()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!vehicle) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('vehicles').update({ ...vehicle, updated_at: new Date().toISOString() }).eq('id', vehicle.id)
    if (error) {
      console.error('Error updating vehicle:', error)
      alert('Erro ao atualizar veículo')
    } else {
      router.push('/admin/veiculos')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!vehicle) return
    if (!confirm('Tem certeza que deseja eliminar este veículo?')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicle.id)
    if (error) {
      console.error('Error deleting vehicle:', error)
      alert('Erro ao eliminar veículo')
      setDeleting(false)
    } else {
      router.push('/admin/veiculos')
    }
  }

  const updateField = (field: keyof Vehicle, value: unknown) => {
    setVehicle(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-shark-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-shark-gold" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-shark-navy flex items-center justify-center">
        <p className="text-shark-silver/60">Veículo não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shark-navy flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/veiculos" className="p-2 text-shark-silver/50 hover:text-shark-silver hover:bg-shark-navy-light rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bebas text-4xl text-shark-silver">EDITAR VEÍCULO</h1>
                <p className="text-shark-silver/60 mt-1 font-mono">{vehicle.make} {vehicle.model} {vehicle.year}</p>
              </div>
            </div>
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-shark-silver mb-6">INFORMAÇÕES BÁSICAS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">MARCA</label>
                  <input type="text" value={vehicle.make} onChange={(e) => updateField('make', e.target.value)} required className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">MODELO</label>
                  <input type="text" value={vehicle.model} onChange={(e) => updateField('model', e.target.value)} required className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">ANO</label>
                  <input type="number" value={vehicle.year} onChange={(e) => updateField('year', parseInt(e.target.value))} required className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">PREÇO (€)</label>
                  <input type="number" step="0.01" value={vehicle.price} onChange={(e) => updateField('price', parseFloat(e.target.value))} required className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-shark-silver mb-6">ESPECIFICAÇÕES TÉCNICAS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">QUILOMETRAGEM</label>
                  <input type="number" value={vehicle.mileage} onChange={(e) => updateField('mileage', parseInt(e.target.value))} required className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">COMBUSTÍVEL</label>
                  <select value={vehicle.fuel_type} onChange={(e) => updateField('fuel_type', e.target.value)} className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none">
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">TRANSMISSÃO</label>
                  <select value={vehicle.transmission} onChange={(e) => updateField('transmission', e.target.value)} className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none">
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="DSG">DSG</option>
                    <option value="PDK">PDK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">POTÊNCIA (CV)</label>
                  <input type="number" value={vehicle.power} onChange={(e) => updateField('power', parseInt(e.target.value))} required className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-shark-silver mb-6">ESTADO</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">ESTADO</label>
                  <select value={vehicle.status} onChange={(e) => updateField('status', e.target.value)} className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none">
                    <option value="available">Disponível</option>
                    <option value="reserved">Reservado</option>
                    <option value="sold">Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-shark-silver/70 text-sm font-mono mb-2">PONTUAÇÃO</label>
                  <input type="number" min="0" max="150" value={vehicle.protocol_score || 0} onChange={(e) => updateField('protocol_score', parseInt(e.target.value))} className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none" />
                </div>
                <div className="flex items-center gap-6 pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={vehicle.featured || false} onChange={(e) => updateField('featured', e.target.checked)} className="w-5 h-5 rounded" />
                    <span className="text-shark-silver text-sm">Destaque</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={vehicle.carpass_status || false} onChange={(e) => updateField('carpass_status', e.target.checked)} className="w-5 h-5 rounded" />
                    <span className="text-shark-silver text-sm">Car-Pass</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-shark-silver mb-6">FOTOGRAFIAS</h2>
              <PhotoUploader
                photos={vehicle.photos || []}
                onChange={(photos) => updateField('photos', photos)}
              />
              <PhotoAnalysisPanel
                vehicleId={vehicle.id}
                photos={vehicle.photos || []}
                label={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                heroPhoto={(vehicle.photos && vehicle.photos[0]) || null}
                onHeroChange={(url) => {
                  const current = vehicle.photos || []
                  const reordered = [url, ...current.filter((p) => p !== url)]
                  updateField('photos', reordered)
                }}
              />
            </div>

            {/* Description */}
            <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-shark-silver mb-6">DESCRIÇÃO</h2>
              <textarea value={vehicle.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={4} className="w-full px-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver focus:border-shark-gold focus:outline-none resize-none" placeholder="Descrição detalhada do veículo..." />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/admin/veiculos" className="px-6 py-3 text-shark-silver/70 hover:text-shark-silver transition-colors">Cancelar</Link>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-shark-gold text-shark-navy font-bebas text-lg rounded-lg hover:bg-shark-gold-light transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                GUARDAR ALTERAÇÕES
              </button>
            </div>
          </form>

          {/* Generated documents */}
          <VehicleDocuments vehicleId={vehicle.id} />
        </div>
      </main>
    </div>
  )
}
