'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-password`,
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F4F8FC' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex mb-6">
            <Image src="/images/shark-logo.png" alt="Shark Automotive" width={200} height={134} className="h-20 w-auto" />
          </div>
          <h1 className="font-mono uppercase tracking-widest text-sm" style={{ color: '#6B7280' }}>Recuperar Password</h1>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #9FADBB' }} className="p-8">
          {sent ? (
            <p style={{ color: '#0E1B2F' }} className="text-sm leading-relaxed">
              Se existir uma conta associada a esse email, enviámos as instruções para redefinir a password.
              Verifica a tua caixa de entrada.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                Introduz o teu email e enviamos-te um link para redefinir a password.
              </p>
              <div>
                <label className="block font-mono uppercase text-xs mb-2" style={{ color: '#6B7280' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 focus:outline-none"
                  style={{ backgroundColor: '#F4F8FC', border: '1px solid #9FADBB', color: '#0E1B2F' }}
                  placeholder="o.teu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-mono uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#0E1B2F', color: '#E8E4DC' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar link
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm" style={{ color: '#6B7280' }}>Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}
