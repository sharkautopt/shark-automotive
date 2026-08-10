"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Trash2, Phone, Mail, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Lead } from "@/lib/types"

const statusColors: Record<string, string> = {
  new: "bg-shark-gold/20 text-shark-gold border-shark-gold/30",
  contacted: "bg-blue-400/20 text-blue-400 border-blue-400/30",
  qualified: "bg-purple-400/20 text-purple-400 border-purple-400/30",
  negotiating: "bg-orange-400/20 text-orange-400 border-orange-400/30",
  converted: "bg-green-400/20 text-green-400 border-green-400/30",
  lost: "bg-red-400/20 text-red-400 border-red-400/30",
}

const typeLabels: Record<string, string> = {
  contact: "Contacto",
  import_request: "Importação",
  financing: "Financiamento",
  investment_partner: "Parceiro",
  vehicle_inquiry: "Veículo",
}

export function LeadsTable({ leads }: { leads: (Lead & { vehicles?: { make: string; model: string } | null })[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [selectedLead, setSelectedLead] = useState<typeof leads[0] | null>(null)

  const filteredLeads = filter === "all" 
    ? leads 
    : leads.filter(l => l.status === filter)

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    
    const updates: Record<string, unknown> = { status }
    if (status === "contacted") {
      updates.contacted_at = new Date().toISOString()
    } else if (status === "converted") {
      updates.converted_at = new Date().toISOString()
    }

    const { error } = await supabase.from("leads").update(updates).eq("id", id)
    
    if (error) {
      alert("Erro ao atualizar status")
      console.error(error)
    } else {
      router.refresh()
    }
  }

  const deleteLead = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar este lead?")) return
    
    const supabase = createClient()
    const { error } = await supabase.from("leads").delete().eq("id", id)
    
    if (error) {
      alert("Erro ao eliminar lead")
      console.error(error)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "new", "contacted", "qualified", "negotiating", "converted", "lost"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-mono whitespace-nowrap transition-colors ${
              filter === status
                ? "bg-shark-gold text-shark-navy"
                : "bg-shark-navy-light/30 text-shark-silver/70 hover:text-shark-silver"
            }`}
          >
            {status === "all" ? "TODOS" : status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-shark-navy-light/30 border border-shark-gold/10 rounded-xl overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-shark-silver/60">Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shark-gold/10">
                  <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">LEAD</th>
                  <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">TIPO</th>
                  <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">VEÍCULO</th>
                  <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">STATUS</th>
                  <th className="text-left p-4 text-shark-silver/60 font-mono text-sm">DATA</th>
                  <th className="text-right p-4 text-shark-silver/60 font-mono text-sm">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id}
                    className="border-b border-shark-gold/5 hover:bg-shark-navy-light/20 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-shark-silver font-medium">{lead.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <a href={`mailto:${lead.email}`} className="text-shark-silver/50 hover:text-shark-gold text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="text-shark-silver/50 hover:text-shark-gold text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-shark-silver/70 text-sm">
                        {typeLabels[lead.lead_type] || lead.lead_type}
                      </span>
                    </td>
                    <td className="p-4">
                      {lead.vehicles ? (
                        <span className="text-shark-silver text-sm">
                          {lead.vehicles.make} {lead.vehicles.model}
                        </span>
                      ) : (
                        <span className="text-shark-silver/30 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status || "new"}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`px-3 py-1 rounded text-xs font-mono bg-transparent border cursor-pointer ${
                          statusColors[lead.status || "new"]
                        }`}
                      >
                        <option value="new">NOVO</option>
                        <option value="contacted">CONTACTADO</option>
                        <option value="qualified">QUALIFICADO</option>
                        <option value="negotiating">NEGOCIANDO</option>
                        <option value="converted">CONVERTIDO</option>
                        <option value="lost">PERDIDO</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="text-shark-silver/50 text-sm">
                        {new Date(lead.created_at).toLocaleDateString("pt-PT")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 text-shark-silver/50 hover:text-shark-gold hover:bg-shark-gold/10 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 text-shark-silver/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
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
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLead(null)}
        >
          <div 
            className="bg-shark-navy border border-shark-gold/20 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bebas text-2xl text-shark-silver mb-4">
              DETALHES DO LEAD
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-shark-silver/50 text-sm font-mono">NOME</span>
                <p className="text-shark-silver">{selectedLead.name}</p>
              </div>
              <div>
                <span className="text-shark-silver/50 text-sm font-mono">EMAIL</span>
                <p className="text-shark-silver">{selectedLead.email}</p>
              </div>
              {selectedLead.phone && (
                <div>
                  <span className="text-shark-silver/50 text-sm font-mono">TELEFONE</span>
                  <p className="text-shark-silver">{selectedLead.phone}</p>
                </div>
              )}
              <div>
                <span className="text-shark-silver/50 text-sm font-mono">TIPO</span>
                <p className="text-shark-silver">{typeLabels[selectedLead.lead_type] || selectedLead.lead_type}</p>
              </div>
              {selectedLead.message && (
                <div>
                  <span className="text-shark-silver/50 text-sm font-mono">MENSAGEM</span>
                  <p className="text-shark-silver whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              )}
              {selectedLead.financing_amount && (
                <div>
                  <span className="text-shark-silver/50 text-sm font-mono">VALOR FINANCIAMENTO</span>
                  <p className="text-shark-gold font-bebas text-xl">{selectedLead.financing_amount.toLocaleString()}€</p>
                </div>
              )}
              {selectedLead.investment_amount && (
                <div>
                  <span className="text-shark-silver/50 text-sm font-mono">VALOR INVESTIMENTO</span>
                  <p className="text-shark-gold font-bebas text-xl">{selectedLead.investment_amount.toLocaleString()}€</p>
                </div>
              )}
              <div>
                <span className="text-shark-silver/50 text-sm font-mono">DATA DE CRIAÇÃO</span>
                <p className="text-shark-silver">
                  {new Date(selectedLead.created_at).toLocaleString("pt-PT")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-shark-gold/10">
              <a
                href={`mailto:${selectedLead.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-shark-gold text-shark-navy font-bebas rounded-lg hover:bg-shark-gold-light transition-colors"
              >
                <Mail className="w-4 h-4" />
                ENVIAR EMAIL
              </a>
              {selectedLead.phone && (
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-bebas rounded-lg hover:bg-green-500 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  WHATSAPP
                </a>
              )}
            </div>

            <button
              onClick={() => setSelectedLead(null)}
              className="w-full mt-4 py-3 text-shark-silver/50 hover:text-shark-silver transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
