'use client'

import Image from 'next/image'
import { LayoutList, FileText, Receipt, MessageSquare, TrendingUp, Settings, LogOut } from 'lucide-react'
import { clientSignOut } from '@/app/area-cliente/actions'
import { useRouter } from 'next/navigation'

export type SectionId = 'estado' | 'documentos' | 'facturas' | 'mensagens' | 'resultados' | 'definicoes'

export type SectionDef = { id: SectionId; label: string; icon: typeof LayoutList }

export const ALL_SECTIONS: SectionDef[] = [
  { id: 'estado', label: 'Estado', icon: LayoutList },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'facturas', label: 'Facturas', icon: Receipt },
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
  { id: 'resultados', label: 'Resultados', icon: TrendingUp },
  { id: 'definicoes', label: 'Definições', icon: Settings },
]

export function ClientSidebar({
  sections,
  active,
  onSelect,
  unread,
}: {
  sections: SectionDef[]
  active: SectionId
  onSelect: (id: SectionId) => void
  unread?: number
}) {
  const router = useRouter()

  async function handleLogout() {
    await clientSignOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col bg-background border-r border-border">
        <div className="p-6 border-b border-border">
          <Image src="/images/shark-logo.png" alt="Shark Automotive" width={150} height={50} className="h-9 w-auto" />
          <p className="font-mono uppercase text-[10px] tracking-widest mt-3 text-muted-foreground">
            Área de Cliente
          </p>
        </div>
        <nav className="flex-1 p-3">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-mono uppercase text-xs tracking-wider transition-colors border-l-2 ${
                  isActive
                    ? 'text-foreground bg-primary/10 border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{s.label}</span>
                {s.id === 'mensagens' && unread ? (
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground">
                    {unread}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-mono uppercase text-xs tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-background border-t border-border">
        {sections.map((s) => {
          const isActive = active === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <s.icon className="w-5 h-5" />
              <span className="text-[9px] font-mono uppercase">{s.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
