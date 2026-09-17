'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RedefinirPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As passwords não coincidem.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError('Não foi possível redefinir a password. O link pode ter expirado.')
      return
    }
    setDone(true)
    setTimeout(() => router.push('/area-cliente'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex mb-6">
            <Image src="/images/shark-logo.png" alt="Shark Automotive" width={200} height={134} className="h-20 w-auto" />
          </div>
          <h1 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">Redefinir Password</h1>
        </div>

        <div className="bg-card border border-border p-8">
          {done ? (
            <p className="text-sm text-foreground">Password redefinida. A redirecionar...</p>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 text-sm bg-destructive/10 text-destructive border border-destructive/30">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-mono uppercase text-xs mb-2 text-muted-foreground">Nova password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase text-xs mb-2 text-muted-foreground">Confirmar password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 font-mono uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 bg-primary text-primary-foreground"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Redefinir
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-muted-foreground">Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}
