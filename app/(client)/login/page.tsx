'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Credenciais inválidas. Verifica o email e a password.')
      setLoading(false)
      return
    }
    router.push('/area-cliente')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex mb-6">
            <Image src="/images/shark-logo.png" alt="Shark Automotive" width={200} height={134} className="h-20 w-auto" />
          </div>
          <h1 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">Área de Cliente</h1>
        </div>

        <div className="bg-card border border-border p-8">
          {error && (
            <div className="mb-6 p-3 text-sm bg-destructive/10 text-destructive border border-destructive/30">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono uppercase text-xs mb-2 text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                placeholder="o.teu@email.com"
              />
            </div>
            <div>
              <label className="block font-mono uppercase text-xs mb-2 text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/recuperar-password" className="text-sm underline text-muted-foreground">
              Esqueceste-te da password?
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground">Voltar ao website</Link>
        </div>
      </div>
    </div>
  )
}
