"use client"

import { ImportCosts } from "@/lib/import/calculate-costs"
import { Euro } from "lucide-react"

interface CostBreakdownProps {
  costs: ImportCosts | null
  loading?: boolean
}

export function SimulatorCostBreakdown({ costs, loading }: CostBreakdownProps) {
  if (loading) {
    return (
      <div className="border border-shark-gold/10 rounded-xl p-6 space-y-3 animate-pulse">
        <div className="h-6 bg-shark-navy-light rounded w-1/3" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-shark-navy-light rounded w-2/5" />
              <div className="h-4 bg-shark-navy-light rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!costs) return null

  return (
    <div className="border border-shark-gold/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-shark-gold/10">
        <Euro className="w-5 h-5 text-shark-gold" />
        <h3 className="font-bebas text-2xl text-shark-silver tracking-wide">ORÇAMENTO DE IMPORTAÇÃO</h3>
      </div>

      {/* Breakdown rows */}
      <div className="space-y-2.5">
        {costs.breakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-sm font-mono text-shark-silver tracking-wider">{item.label}</p>
              {item.note && <p className="text-xs text-shark-silver/50 mt-0.5">{item.note}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-shark-gold font-semibold">
                {item.value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-shark-gold/20 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-mono text-shark-platinum tracking-wider">TOTAL A PAGAR</p>
          <p className="text-xl font-bebas text-shark-gold tracking-wide">
            {costs.total.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-shark-navy-light/50 border border-shark-gold/5 rounded-lg p-3.5 space-y-1">
        <p className="text-xs text-shark-silver/70 font-mono tracking-tight">
          ℹ️ Este é um orçamento estimado. O ISV é calculado com base em dados públicos mas pode variar.
          <br />
          A taxa de serviço Shark inclui transporte, seguro e todos os encargos documentais e notariais
          necessários.
        </p>
      </div>
    </div>
  )
}
