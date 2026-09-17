// Shared "Identificação" fields (Origem, Segmento, Matrícula) used by both the
// vehicle create and edit admin forms, so they can't drift out of sync again.
// Styled to match the surrounding raw <select>/<input> fields in those forms —
// this gets swept into the shared UI primitives when the admin gets restyled.

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
