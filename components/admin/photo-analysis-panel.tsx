'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Star, Trophy, AlertCircle } from 'lucide-react'

interface PhotoScore {
  url: string
  score: number
  category: string
  quality: string
  notes: string
}

interface PhotoAnalysisPanelProps {
  vehicleId: string
  photos: string[]
  label: string
  heroPhoto: string | null
  onHeroChange: (url: string) => void
}

export function PhotoAnalysisPanel({
  vehicleId,
  photos,
  label,
  heroPhoto,
  onHeroChange,
}: PhotoAnalysisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [scores, setScores] = useState<PhotoScore[]>([])
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)

  const runAnalysis = async () => {
    if (photos.length === 0) {
      setError('Adicione fotografias antes de analisar.')
      return
    }
    setAnalyzing(true)
    setError(null)
    setUsedFallback(false)

    try {
      const res = await fetch('/api/admin/photo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, photos, label }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro na análise.')
        return
      }

      if (!data.analyzed) {
        // AI unavailable — fell back to upload order
        setUsedFallback(true)
      }

      setScores(data.scores || [])
      if (data.heroPhoto) {
        onHeroChange(data.heroPhoto)
      }
    } catch {
      setError('Não foi possível contactar o serviço de análise.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="mt-6 border-t border-primary/10 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            ANÁLISE INTELIGENTE DE FOTOS
          </h3>
          <p className="text-muted-foreground/50 text-sm font-mono mt-1">
            A IA classifica cada foto e escolhe a melhor imagem de capa.
          </p>
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={analyzing || photos.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display text-base rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {analyzing ? 'A ANALISAR...' : 'ANALISAR COM IA'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {usedFallback && (
        <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Serviço de IA indisponível. Mantida a ordem de carregamento das fotos.
        </div>
      )}

      {scores.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {scores.map((s, idx) => {
            const isHero = heroPhoto === s.url
            return (
              <div
                key={s.url}
                className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                  isHero ? 'border-primary' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url || '/placeholder.svg'} alt={`${label} ${idx + 1}`} className="w-full h-32 object-cover" />

                {idx === 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    <Trophy className="w-3 h-3" />
                    TOP
                  </div>
                )}

                <div
                  className="absolute top-2 right-2 bg-background/80 text-primary text-xs font-mono font-bold px-2 py-1 rounded cursor-help"
                  title={s.notes ? `${s.category} · ${s.quality} — ${s.notes}` : s.category}
                >
                  {s.score}
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-background/85 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => onHeroChange(s.url)}
                    className={`w-full flex items-center justify-center gap-1 text-xs font-mono transition-colors ${
                      isHero ? 'text-primary' : 'text-muted-foreground/70 hover:text-foreground'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${isHero ? 'fill-primary' : ''}`} />
                    {isHero ? 'CAPA' : 'Definir capa'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {scores.length > 0 && (
        <p className="text-muted-foreground/40 text-xs font-mono mt-4">
          Passe o rato sobre a pontuação para ver a justificação da IA. Pode sempre alterar a capa manualmente.
        </p>
      )}
    </div>
  )
}
