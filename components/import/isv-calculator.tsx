'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SectionHeading } from '@/components/ui/section-heading'
import {
  calculateISVDetailed,
  type FuelCategory,
  type ISVBreakdown,
  type Norma,
} from '@/lib/import/calculate-isv'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ISVCalculator() {
  const [fuelType, setFuelType] = useState<FuelCategory | ''>('')
  const [engineCC, setEngineCC] = useState('')
  const [co2, setCo2] = useState('')
  const [year, setYear] = useState('')
  const [norma, setNorma] = useState<Norma | ''>('')
  const [particulatesConfirmed, setParticulatesConfirmed] = useState(false)
  const [result, setResult] = useState<ISVBreakdown | null>(null)

  const isDiesel = fuelType === 'gasoleo'
  const canCalculate = Boolean(fuelType && engineCC && year && norma)

  const calculateISV = () => {
    if (!fuelType || !norma) return

    const breakdown = calculateISVDetailed({
      fuel: fuelType,
      cc: parseInt(engineCC) || undefined,
      co2: parseInt(co2) || undefined,
      norma,
      registrationYear: parseInt(year) || undefined,
      particulatesConfirmed: isDiesel && particulatesConfirmed,
    })

    setResult(breakdown)
  }

  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Simulação"
          title="CALCULADORA ISV"
          description="Simule o valor aproximado do Imposto Sobre Veículos para a sua importação."
          className="mb-12"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card/50 border border-border/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#2E6B9E]" />
              </div>
              <h3 className="font-display text-xl text-foreground">Simulador ISV</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Tipo de Combustível</Label>
                <Select
                  value={fuelType}
                  onValueChange={(v) => setFuelType(v as FuelCategory)}
                >
                  <SelectTrigger className="bg-background border-border/50">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina / GPL / GN</SelectItem>
                    <SelectItem value="gasoleo">Gasóleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cilindrada (cc)</Label>
                <Input
                  type="number"
                  value={engineCC}
                  onChange={(e) => setEngineCC(e.target.value)}
                  placeholder="Ex: 1998"
                  className="bg-background border-border/50"
                />
              </div>

              <div>
                <Label>Emissões CO2 (g/km)</Label>
                <Input
                  type="number"
                  value={co2}
                  onChange={(e) => setCo2(e.target.value)}
                  placeholder="Ex: 150"
                  className="bg-background border-border/50"
                />
              </div>

              <div>
                <Label>Ano da 1ª Matrícula</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ex: 2022"
                  className="bg-background border-border/50"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <Label>Norma de homologação</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Ajuda sobre a norma de homologação"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Consulte o Certificado de Conformidade (CoC) ou DUA do veículo.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={norma} onValueChange={(v) => setNorma(v as Norma)}>
                  <SelectTrigger className="bg-background border-border/50">
                    <SelectValue placeholder="Selecione NEDC ou WLTP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEDC">NEDC</SelectItem>
                    <SelectItem value="WLTP">WLTP</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Obrigatório — nunca é adivinhado a partir do ano. Veículos de 2018–2019 podem ser
                  homologados por qualquer uma das normas, e o valor final varia centenas de euros
                  entre elas.
                </p>
              </div>

              {isDiesel && (
                <div className="md:col-span-2 flex items-start gap-2">
                  <Checkbox
                    id="particulates"
                    checked={particulatesConfirmed}
                    onCheckedChange={(checked) => setParticulatesConfirmed(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="particulates" className="text-sm font-normal leading-relaxed">
                    Confirmo emissão de partículas ≥0,001g/km (gasóleo) — adiciona 500 € ao ISV
                  </Label>
                </div>
              )}
            </div>

            <Button
              onClick={calculateISV}
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              disabled={!canCalculate}
            >
              Calcular ISV
            </Button>

            {result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="p-6 bg-primary/10 border border-primary/20 text-center">
                  <p className="text-sm text-muted-foreground mb-2">ISV Estimado</p>
                  <p className="font-display text-4xl text-primary">
                    {result.total.toLocaleString('pt-PT')} €
                  </p>
                </div>

                <div className="border border-border/50 divide-y divide-border/50 text-sm">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-muted-foreground">Componente cilindrada (bruto)</span>
                    <span className="text-foreground">
                      {result.cilindradaBruta.toLocaleString('pt-PT')} €
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-muted-foreground">Componente cilindrada (após desconto)</span>
                    <span className="text-foreground font-medium">
                      {result.cilindradaFinal.toLocaleString('pt-PT')} €
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-muted-foreground">Componente ambiental (bruto)</span>
                    <span className="text-foreground">
                      {result.ambientalBruta.toLocaleString('pt-PT')} €
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-muted-foreground">Componente ambiental (após desconto)</span>
                    <span className="text-foreground font-medium">
                      {result.ambientalFinal.toLocaleString('pt-PT')} €
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-muted-foreground">
                      Desconto por idade ({result.ageYears.toLocaleString('pt-PT')} anos)
                    </span>
                    <span className="text-foreground">
                      {Math.round(result.descontoPercentagem * 100)}%
                    </span>
                  </div>
                  {result.particulas > 0 && (
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-muted-foreground">Taxa de partículas</span>
                      <span className="text-foreground">
                        {result.particulas.toLocaleString('pt-PT')} €
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                O desconto por idade aplica-se apenas a veículos usados importados de outro Estado-Membro
                da UE. Este valor é uma estimativa; o cálculo real do ISV depende de variáveis adicionais.
                Contacte-nos para um orçamento detalhado.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
