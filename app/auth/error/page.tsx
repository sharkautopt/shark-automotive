import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display tracking-wide">Erro de Autenticação</h1>
          <p className="text-muted-foreground">
            Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/admin/login">Voltar ao Login</Link>
        </Button>
      </div>
    </div>
  )
}
