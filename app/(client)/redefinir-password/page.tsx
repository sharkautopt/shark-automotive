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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F4F8FC' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex mb-6">
            <Image src="/images/shark-logo.png" alt="Shark Automotive" width={200} height={134} className="h-20 w-auto" />
          </div>
          <h1 className="font-mono uppercase tracking-widest text-sm" style={{ color: '#6B7280' }}>Redefinir Password</h1>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #C8C4BC' }} className="p-8">
          {done ? (
            <p style={{ color: '#0D1B2A' }} className="text-sm">Password redefinida. A redirecionar...</p>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-mono uppercase text-xs mb-2" style={{ color: '#6B7280' }}>Nova password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 focus:outline-none"
                    style={{ backgroundColor: '#F4F8FC', border: '1px solid #C8C4BC', color: '#0D1B2A' }}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase text-xs mb-2" style={{ color: '#6B7280' }}>Confirmar password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3 focus:outline-none"
                    style={{ backgroundColor: '#F4F8FC', border: '1px solid #C8C4BC', color: '#0D1B2A' }}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 font-mono uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#0D1B2A', color: '#E8E4DC' }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Redefinir
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm" style={{ color: '#6B7280' }}>Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}
