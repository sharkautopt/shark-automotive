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
import { SectionHeading } from '@/components/ui/section-heading'

export function ISVCalculator() {
  const [fuelType, setFuelType] = useState('')
  const [engineCC, setEngineCC] = useState('')
  const [co2, setCo2] = useState('')
  const [year, setYear] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const calculateISV = () => {
    // Simplified ISV calculation for demonstration
    // Real calculation would be more complex based on Portuguese tax tables
    const cc = parseInt(engineCC) || 0
    const emissions = parseInt(co2) || 0
    const vehicleYear = parseInt(year) || new Date().getFullYear()
    const age = new Date().getFullYear() - vehicleYear

    let componenteA = 0
    let componenteB = 0

    // Componente cilindrada (simplified)
    if (fuelType === 'gasolina') {
      if (cc <= 1000) componenteA = cc * 0.5
      else if (cc <= 1250) componenteA = 500 + (cc - 1000) * 0.7
      else if (cc <= 1750) componenteA = 675 + (cc - 1250) * 1.5
      else if (cc <= 2500) componenteA = 1425 + (cc - 1750) * 4.0
      else componenteA = 4425 + (cc - 2500) * 7.0
    } else if (fuelType === 'diesel') {
      if (cc <= 1250) componenteA = cc * 0.6
      else if (cc <= 1750) componenteA = 750 + (cc - 1250) * 1.0
      else if (cc <= 2500) componenteA = 1250 + (cc - 1750) * 5.5
      else componenteA = 5375 + (cc - 2500) * 10.0
    } else if (fuelType === 'hibrido') {
      componenteA = (cc * 0.3) // Reduced rate for hybrids
    } else if (fuelType === 'eletrico') {
      componenteA = 0 // Zero for electric
    }

    // Componente ambiental (simplified)
    if (emissions > 0 && fuelType !== 'eletrico') {
      if (emissions <= 120) componenteB = emissions * 4.5
      else if (emissions <= 180) componenteB = 540 + (emissions - 120) * 7.5
      else if (emissions <= 250) componenteB = 990 + (emissions - 180) * 18
      else componenteB = 2250 + (emissions - 250) * 40
    }

    // Age reduction
    let ageReduction = 1
    if (age >= 1 && age < 2) ageReduction = 0.90
    else if (age >= 2 && age < 3) ageReduction = 0.80
    else if (age >= 3 && age < 4) ageReduction = 0.70
    else if (age >= 4 && age < 5) ageReduction = 0.60
    else if (age >= 5) ageReduction = 0.52

    const total = Math.round((componenteA + componenteB) * ageReduction)
    setResult(Math.max(0, total))
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
                <Calculator className="w-5 h-5 text-[#5A7A9A]" />
              </div>
              <h3 className="font-display text-xl text-foreground">Simulador ISV</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Tipo de Combustível</Label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger className="bg-background border-border/50">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                    <SelectItem value="eletrico">Elétrico</SelectItem>
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
            </div>

            <Button
              onClick={calculateISV}
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              disabled={!fuelType || !engineCC || !year}
            >
              Calcular ISV
            </Button>

            {result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-primary/10 border border-primary/20 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">ISV Estimado</p>
                <p className="font-display text-4xl text-primary">
                  {result.toLocaleString('pt-PT')} €
                </p>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Este valor é uma estimativa simplificada. O cálculo real do ISV depende de 
                variáveis adicionais e das tabelas oficiais em vigor. Contacte-nos para um 
                orçamento detalhado.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
