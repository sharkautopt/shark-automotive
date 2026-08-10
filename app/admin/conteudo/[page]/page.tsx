'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Save, RotateCcw, ExternalLink, Lock, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContentItem {
  id: string
  section: string
  content_key: string
  value: string | null
  content_type: 'text' | 'textarea' | 'image' | 'number'
  character_limit: number | null
  locked: boolean
}

const pageConfig: Record<string, { name: string; url: string }> = {
  home: { name: 'Página Inicial', url: '/' },
  protocolo: { name: 'Protocolo', url: '/protocolo' },
  inventario: { name: 'Inventário', url: '/inventario' },
  importacao: { name: 'Importação', url: '/importacao' },
  parceiros: { name: 'Parceiros', url: '/parceiros' },
  'quem-somos': { name: 'Quem Somos', url: '/quem-somos' },
  contacto: { name: 'Contacto', url: '/contacto' },
}

// Friendly section labels
const sectionLabels: Record<string, string> = {
  hero: 'Hero',
  hero_stats: 'Estatísticas do Hero',
  stats: 'Barra de Estatísticas',
  protocol: 'Protocolo',
  inside_process: 'Por Dentro do Processo',
  featured: 'Veículos em Destaque',
  cta: 'Chamada à Ação (CTA)',
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PageContentEditor({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = use(params)
  const config = pageConfig[page] || { name: 'Página Desconhecida', url: '/' }

  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Record<string, string>>({})
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/admin/content?page=${encodeURIComponent(page)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        setContent(data.content || [])
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page])

  const handleChange = (item: ContentItem, value: string) => {
    const changeKey = `${item.section}/${item.content_key}`
    setChanges((prev) => {
      const next = { ...prev }
      if (value === (item.value ?? '')) {
        delete next[changeKey]
      } else {
        next[changeKey] = value
      }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        page,
        changes: Object.entries(changes).map(([k, value]) => {
          const [section, ...keyParts] = k.split('/')
          return { section, content_key: keyParts.join('/'), value }
        }),
      }
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao guardar')

      // Merge saved values into local content, clear pending changes
      setContent((prev) =>
        prev.map((item) => {
          const ck = `${item.section}/${item.content_key}`
          return ck in changes ? { ...item, value: changes[ck] } : item
        })
      )
      setChanges({})
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setChanges({})
  }

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        A carregar conteúdo…
      </div>
    )
  }

  // Group content by section, preserving insertion order
  const sections: string[] = []
  const grouped: Record<string, ContentItem[]> = {}
  for (const item of content) {
    if (!grouped[item.section]) {
      grouped[item.section] = []
      sections.push(item.section)
    }
    grouped[item.section].push(item)
  }

  const pendingCount = Object.keys(changes).length

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/conteudo" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{config.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {content.length} campos · edite e guarde para publicar
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
          <a href={config.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            Ver no Site
          </a>
        </Button>
      </div>

      {error && (
        <div className="border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {content.length === 0 && !error && (
        <div className="border border-border/50 bg-card/30 p-12 text-center text-muted-foreground">
          Ainda não há conteúdo para esta página na base de dados.
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isCollapsed = collapsed[section]
          const items = grouped[section]
          const sectionChanges = items.filter(
            (i) => `${i.section}/${i.content_key}` in changes
          ).length

          return (
            <div key={section} className="border border-border/50">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between px-5 py-4 bg-card/40 hover:bg-card/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs tracking-[3px] uppercase text-[#5A7A9A]">
                    {sectionLabels[section] || formatKey(section)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({items.length})
                  </span>
                  {sectionChanges > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary font-mono">
                      {sectionChanges} alterado(s)
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isCollapsed ? '-rotate-90' : ''
                  }`}
                />
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-border/40">
                  {items.map((item) => {
                    const changeKey = `${item.section}/${item.content_key}`
                    const currentValue =
                      changeKey in changes ? changes[changeKey] : item.value ?? ''
                    const isDirty = changeKey in changes
                    const overLimit =
                      item.character_limit != null &&
                      currentValue.length > item.character_limit

                    return (
                      <div key={item.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            {formatKey(item.content_key)}
                            {item.locked && (
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            )}
                            {isDirty && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </label>
                          {item.character_limit != null && (
                            <span
                              className={`text-xs font-mono ${
                                overLimit ? 'text-destructive' : 'text-muted-foreground'
                              }`}
                            >
                              {currentValue.length}/{item.character_limit}
                            </span>
                          )}
                        </div>

                        {item.content_type === 'image' ? (
                          <div className="flex items-start gap-4">
                            <div className="relative w-28 h-20 shrink-0 border border-border/50 bg-muted overflow-hidden">
                              {currentValue ? (
                                <Image
                                  src={currentValue || "/placeholder.svg"}
                                  alt=""
                                  fill
                                  sizes="112px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <input
                              type="text"
                              value={currentValue}
                              disabled={item.locked}
                              onChange={(e) => handleChange(item, e.target.value)}
                              className="flex-1 bg-background border border-border/60 px-3 py-2 text-sm font-mono disabled:opacity-50"
                              placeholder="/images/… ou URL"
                            />
                          </div>
                        ) : item.content_type === 'textarea' ? (
                          <textarea
                            value={currentValue}
                            disabled={item.locked}
                            rows={3}
                            onChange={(e) => handleChange(item, e.target.value)}
                            className={`w-full bg-background border px-3 py-2 text-sm resize-y disabled:opacity-50 ${
                              overLimit ? 'border-destructive' : 'border-border/60'
                            }`}
                          />
                        ) : (
                          <input
                            type={item.content_type === 'number' ? 'text' : 'text'}
                            value={currentValue}
                            disabled={item.locked}
                            onChange={(e) => handleChange(item, e.target.value)}
                            className={`w-full bg-background border px-3 py-2 text-sm disabled:opacity-50 ${
                              overLimit ? 'border-destructive' : 'border-border/60'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky save bar */}
      {pendingCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-background border-t border-border/50 px-6 py-4 flex items-center justify-between z-10">
          <p className="text-sm text-muted-foreground">
            {pendingCount} alteração(ões) pendente(s)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
              className="gap-2 bg-transparent"
            >
              <RotateCcw className="w-4 h-4" />
              Reverter
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
            >
              <Save className="w-4 h-4" />
              {saving ? 'A guardar…' : 'Guardar Alterações'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
