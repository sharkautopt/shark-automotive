"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "unauthorized" 
      ? "Acesso não autorizado. Apenas administradores podem aceder."
      : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error("Credenciais inválidas. Verifique o email e password.")
      }

      // Check if user is admin
      if (data.user?.user_metadata?.is_admin !== true) {
        await supabase.auth.signOut()
        throw new Error("Acesso não autorizado. Apenas administradores podem aceder.")
      }

      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            EMAIL
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-shark-silver/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
              placeholder="admin@sharkautomotive.pt"
            />
          </div>
        </div>

        <div>
          <label className="block text-shark-silver/70 text-sm font-mono mb-2">
            PASSWORD
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-shark-silver/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-shark-navy border border-shark-gold/20 rounded-lg text-shark-silver placeholder-shark-silver/30 focus:border-shark-gold focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-shark-gold text-shark-navy font-bebas text-xl tracking-wider rounded-lg hover:bg-shark-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              A ENTRAR...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              ENTRAR
            </>
          )}
        </motion.button>
      </form>
    </>
  )
}

function LoginFormFallback() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-16 bg-shark-silver/10 rounded mb-2" />
        <div className="h-12 bg-shark-silver/5 border border-shark-gold/10 rounded-lg" />
      </div>
      <div>
        <div className="h-4 w-20 bg-shark-silver/10 rounded mb-2" />
        <div className="h-12 bg-shark-silver/5 border border-shark-gold/10 rounded-lg" />
      </div>
      <div className="h-14 bg-shark-gold/20 rounded-lg animate-pulse" />
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-shark-navy flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-shark-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-shark-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-shark-navy-light/30 border border-shark-gold/20 rounded-2xl p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/shark-logo.png"
              alt="Shark Automotive"
              width={200}
              height={70}
              className="mx-auto mb-4"
            />
            <h1 className="font-bebas text-2xl text-shark-silver">
              ADMIN <span className="text-shark-gold">DASHBOARD</span>
            </h1>
            <p className="text-shark-silver/50 text-sm mt-2">
              Acesso restrito a administradores
            </p>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          {/* Back to site */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-shark-silver/50 hover:text-shark-gold text-sm transition-colors"
            >
              Voltar ao website
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
