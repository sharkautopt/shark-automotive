// Shared "Identificação" fields used by both the vehicle create and edit
// admin forms, so they can't drift out of sync again. Styled to match the
// surrounding raw <select>/<input> fields in those forms — this gets swept
// into the shared UI primitives when the admin gets restyled.

export const ORIGEM_OPTIONS = [
  'Nacional', 'Alemanha', 'Holanda', 'Bélgica', 'França', 'Itália', 'Espanha',
  'Áustria', 'Suíça', 'Luxemburgo', 'Dinamarca', 'Suécia', 'Japão', 'EUA',
] as const

// Deliberately not alphabetical: citadinos → berlinas → desportivos → SUV → comerciais.
export const SEGMENTO_OPTIONS = [
  'Citadino compacto', 'Citadino', 'Utilitário', 'Berlina compacta', 'Berlina',
  'Berlina executiva', 'Carrinha', 'Coupé', 'Cabrio / Descapotável', 'Roadster',
  'SUV compacto', 'SUV', 'SUV grande', 'Crossover', 'Monovolume',
  'Comercial ligeiro', 'Pick-up',
] as const

const fieldClass =
  'w-full px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground focus:border-primary focus:outline-none'
const labelClass = 'block text-muted-foreground/70 text-sm font-mono mb-2'

interface VehicleIdentificationFieldsProps {
  origem: string
  segmento: string | null
  plate: string | null
  onOrigemChange: (value: string) => void
  onSegmentoChange: (value: string) => void
  onPlateChange: (value: string) => void
}

export function VehicleIdentificationFields({
  origem,
  segmento,
  plate,
  onOrigemChange,
  onSegmentoChange,
  onPlateChange,
}: VehicleIdentificationFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClass}>ORIGEM</label>
        <select value={origem} onChange={(e) => onOrigemChange(e.target.value)} className={fieldClass}>
          {ORIGEM_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>SEGMENTO</label>
        <select value={segmento ?? ''} onChange={(e) => onSegmentoChange(e.target.value)} className={fieldClass}>
          <option value="">Selecionar</option>
          {SEGMENTO_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>MATRÍCULA</label>
        <input
          type="text"
          value={plate ?? ''}
          onChange={(e) => onPlateChange(e.target.value)}
          placeholder="AA-00-AA"
          className={fieldClass}
        />
      </div>
    </>
  )
}

// Fields needed only for the Declaração de Circulação / Orçamento de
// Importação document suite — split from VehicleIdentificationFields so
// forms that don't generate those documents aren't forced to show them.
interface VehicleDeclarationFieldsProps {
  foreignPlate: string | null
  nationalRegistrationDate: string | null
  categoria: string | null
  taraKg: number | null
  pesoBrutoKg: number | null
  onForeignPlateChange: (value: string) => void
  onNationalRegistrationDateChange: (value: string) => void
  onCategoriaChange: (value: string) => void
  onTaraKgChange: (value: number | null) => void
  onPesoBrutoKgChange: (value: number | null) => void
}

export function VehicleDeclarationFields({
  foreignPlate,
  nationalRegistrationDate,
  categoria,
  taraKg,
  pesoBrutoKg,
  onForeignPlateChange,
  onNationalRegistrationDateChange,
  onCategoriaChange,
  onTaraKgChange,
  onPesoBrutoKgChange,
}: VehicleDeclarationFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClass}>MAT. ESTRANGEIRA</label>
        <input
          type="text"
          value={foreignPlate ?? ''}
          onChange={(e) => onForeignPlateChange(e.target.value)}
          placeholder="M-AB 4217"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>DATA MAT. NACIONAL</label>
        <input
          type="date"
          value={nationalRegistrationDate ?? ''}
          onChange={(e) => onNationalRegistrationDateChange(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>CATEGORIA / TIPO</label>
        <input
          type="text"
          value={categoria ?? ''}
          onChange={(e) => onCategoriaChange(e.target.value)}
          placeholder="Ligeiro / Passageiros"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>TARA (KG)</label>
        <input
          type="number"
          value={taraKg ?? ''}
          onChange={(e) => onTaraKgChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>PESO BRUTO (KG)</label>
        <input
          type="number"
          value={pesoBrutoKg ?? ''}
          onChange={(e) => onPesoBrutoKgChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
          className={fieldClass}
        />
      </div>
    </>
  )
}
