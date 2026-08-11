import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Lock } from 'lucide-react'

const navigation = {
  main: [
    { name: 'Protocolo', href: '/protocolo' },
    { name: 'Viaturas', href: '/inventario' },
    { name: 'Encomenda', href: '/importacao' },
    { name: 'Parceiros', href: '/parceiros' },
    { name: 'Contacto', href: '/contacto' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-primary/15">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/shark-logo.png"
              alt="Shark Automotive"
              width={160}
              height={50}
              className="h-10 w-auto"
            />
          </Link>

          {/* Tagline */}
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-muted-foreground">
            Zero Conversas. Total Transparência.
          </p>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Shark Auto. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-6">
              {/* Área Restrita */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] tracking-[2px] uppercase text-muted-foreground/70">
                  <Lock className="w-3 h-3" />
                  Área Restrita
                </span>
                <Link
                  href="/area-cliente"
                  className="text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Cliente
                </Link>
                <Link
                  href="/admin/login"
                  className="text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Admin
                </Link>
              </div>

              {/* Social */}
              <a
                href="https://instagram.com/sharkauto.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @sharkauto.pt
              </a>
            </div>
          </div>

          {/* Legal identification */}
          <p className="mt-4 font-sans text-[11px] leading-[1.6] text-[#2E6B9E] text-center sm:text-left">
            O website www.sharkauto.pt é propriedade e gerido por ESTIRPESÓBRIA – SOCIEDADE UNIPESSOAL LDA · Avenida Luís Bívar, nº 91, Piso 1 e 0, Fração A, Lisboa · NIPC: 519473108 · Licença de Comércio e Atividades Aduaneiras Registada.
          </p>
        </div>
      </div>
    </footer>
  )
}
