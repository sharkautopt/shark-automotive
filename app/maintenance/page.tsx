import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manutenção | Shark Automotive',
  description: 'O site da Shark Automotive está temporariamente em manutenção.',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,hsl(var(--primary)/0.12),transparent_42%)]" />
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <Image
          src="/images/shark-fin-logo.png"
          alt="Shark Automotive"
          width={420}
          height={160}
          className="mb-12 h-20 w-auto object-contain sm:h-28"
          priority
        />
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-primary">Shark Automotive</p>
        <h1 className="max-w-xl font-display text-5xl uppercase leading-none tracking-wide text-foreground sm:text-7xl">
          Estamos a preparar algo melhor.
        </h1>
        <div className="my-8 h-px w-20 bg-primary" />
        <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
          O site está temporariamente indisponível para manutenção. Voltamos em breve com a mesma transparência, agora com uma experiência ainda melhor.
        </p>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Zero conversas. Total transparência.
        </p>
      </div>
    </main>
  )
}
