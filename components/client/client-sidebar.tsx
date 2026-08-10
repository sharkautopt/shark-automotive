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
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col"
        style={{ backgroundColor: '#0D1B2A' }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid rgba(200,196,188,0.15)' }}>
          <Image src="/images/shark-logo.png" alt="Shark Automotive" width={150} height={50} className="h-9 w-auto" />
          <p className="font-mono uppercase text-[10px] tracking-widest mt-3" style={{ color: '#8B93A1' }}>
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
                className="w-full flex items-center gap-3 px-4 py-3 font-mono uppercase text-xs tracking-wider transition-colors"
                style={{
                  color: isActive ? '#E8E4DC' : '#8B93A1',
                  backgroundColor: isActive ? 'rgba(232,228,220,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #E8E4DC' : '2px solid transparent',
                }}
              >
                <s.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{s.label}</span>
                {s.id === 'mensagens' && unread ? (
                  <span className="text-[10px] px-1.5 py-0.5" style={{ backgroundColor: '#E8E4DC', color: '#0D1B2A' }}>
                    {unread}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
        <div className="p-3" style={{ borderTop: '1px solid rgba(200,196,188,0.15)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-mono uppercase text-xs tracking-wider transition-colors"
            style={{ color: '#8B93A1' }}
          >
            <LogOut className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ backgroundColor: '#0D1B2A', borderTop: '1px solid rgba(200,196,188,0.15)' }}
      >
        {sections.map((s) => {
          const isActive = active === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3"
              style={{ color: isActive ? '#E8E4DC' : '#8B93A1' }}
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
