"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Loader2, Star, GripVertical } from "lucide-react"

interface PhotoUploaderProps {
  photos: string[]
  onChange: (photos: string[]) => void
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setIsUploading(true)

    const supabase = createClient()
    const uploaded: string[] = []

    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`"${file.name}" excede o limite de 10MB.`)
          continue
        }
        const ext = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("vehicle-photos")
          .upload(fileName, file, { cacheControl: "3600", upsert: false })

        if (uploadError) {
          console.error("[v0] Upload error:", uploadError)
          setError("Erro ao carregar imagem. Verifique as permissões.")
          continue
        }

        const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(fileName)
        uploaded.push(data.publicUrl)
      }

      if (uploaded.length > 0) {
        onChange([...photos, ...uploaded])
      }
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  const makePrimary = (index: number) => {
    if (index === 0) return
    const reordered = [...photos]
    const [selected] = reordered.splice(index, 1)
    reordered.unshift(selected)
    onChange(reordered)
  }

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return
    const reordered = [...photos]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    onChange(reordered)
    setDragIndex(null)
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-primary/30 rounded-xl text-muted-foreground/70 hover:border-primary/60 hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="font-mono text-sm">A CARREGAR...</span>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-primary" />
            <span className="font-mono text-sm">CLIQUE PARA CARREGAR FOTOS</span>
            <span className="text-xs text-muted-foreground/40">JPG, PNG, WEBP — máx. 10MB cada</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      {photos.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground/50 font-mono">
            {photos.length} FOTO(S) — A PRIMEIRA É A PRINCIPAL. ARRASTE PARA REORDENAR.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((url, index) => (
              <div
                key={url}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-primary/20 bg-background"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url || "/placeholder.svg"} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />

                {index === 0 && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
                    <Star className="w-3 h-3 fill-current" />
                    PRINCIPAL
                  </span>
                )}

                <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(index)}
                      title="Definir como principal"
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    title="Remover foto"
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <GripVertical className="absolute bottom-2 right-2 w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
