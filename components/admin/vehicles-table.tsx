"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Eye, Star, FileDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Vehicle } from "@/lib/types"

export function VehiclesTable({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar este veículo?")) return
    
    setIsDeleting(id)
    const supabase = createClient()
    
    const { error } = await supabase.from("vehicles").delete().eq("id", id)
    
    if (error) {
      alert("Erro ao eliminar veículo")
      console.error(error)
    } else {
      router.refresh()
    }
    
    setIsDeleting(null)
  }

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from("vehicles")
      .update({ featured: !currentFeatured })
      .eq("id", id)
    
    if (error) {
      alert("Erro ao atualizar veículo")
      console.error(error)
    } else {
      router.refresh()
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from("vehicles")
      .update({ status })
      .eq("id", id)
    
    if (error) {
      alert("Erro ao atualizar status")
      console.error(error)
    } else {
      router.refresh()
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl p-12 text-center">
        <p className="text-shark-silver/60">Nenhum veículo em inventário</p>
      </div>
    )
  }

  return (
    <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-shark-gold/10">
              <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">VEÍCULO</th>
              <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">ANO</th>
              <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">KM</th>
              <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">PREÇO</th>
              <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">STATUS</th>
              <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">PROTOCOLO</th>
              <th className="text-right p-4 text-shark-silver/60 font-mono text-sm">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr 
                key={vehicle.id} 
                className="border-b border-shark-gold/5 hover:bg-shark-navy-light/20 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFeatured(vehicle.id, vehicle.featured || false)}
                      className={`p-1 rounded transition-colors ${
                        vehicle.featured 
                          ? "text-shark-gold" 
                          : "text-shark-silver/30 hover:text-shark-gold/50"
                      }`}
                    >
                      <Star className="w-4 h-4" fill={vehicle.featured ? "currentColor" : "none"} />
                    </button>
                    <div>
                      <p className="text-shark-silver font-medium">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-shark-silver/50 text-sm">{vehicle.fuel_type} • {vehicle.transmission}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-shark-silver">{vehicle.year}</td>
                <td className="p-4 text-shark-silver">{vehicle.mileage?.toLocaleString()} km</td>
                <td className="p-4">
                  <span className="text-shark-gold font-bebas text-xl">
                    {vehicle.price?.toLocaleString()}€
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={vehicle.status || "available"}
                    onChange={(e) => updateStatus(vehicle.id, e.target.value)}
                    className={`px-3 py-1 rounded text-xs font-mono bg-transparent border cursor-pointer ${
                      vehicle.status === "available" 
                        ? "border-green-400/50 text-green-400"
                        : vehicle.status === "reserved"
                        ? "border-yellow-400/50 text-yellow-400"
                        : "border-red-400/50 text-red-400"
                    }`}
                  >
                    <option value="available">DISPONÍVEL</option>
                    <option value="reserved">RESERVADO</option>
                    <option value="sold">VENDIDO</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-shark-navy rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-shark-gold rounded-full"
                        style={{ width: `${((vehicle.protocol_score || 0) / 150) * 100}%` }}
                      />
                    </div>
                    <span className="text-shark-silver/60 text-sm font-mono">
                      {vehicle.protocol_score}/150
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/inventario/${vehicle.id}`}
                      target="_blank"
                      className="p-2 text-shark-silver/50 hover:text-shark-silver hover:bg-shark-navy-light rounded transition-colors"
                      title="Ver no site"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={`/api/vehicles/${vehicle.id}/ficha`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-shark-silver/50 hover:text-shark-gold hover:bg-shark-gold/10 rounded transition-colors"
                      title="Descarregar ficha (PDF)"
                    >
                      <FileDown className="w-4 h-4" />
                    </a>
                    <a
                      href={`/admin/veiculos/${vehicle.id}`}
                      className="p-2 text-shark-silver/50 hover:text-shark-gold hover:bg-shark-gold/10 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={isDeleting === vehicle.id}
                      className="p-2 text-shark-silver/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
