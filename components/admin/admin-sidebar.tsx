"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  TrendingUp,
  FileText,
  Briefcase,
  FileEdit
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/veiculos", icon: Car, label: "Veículos" },
  { href: "/admin/operacoes", icon: Briefcase, label: "Operações" },
  { href: "/admin/documentos", icon: FileText, label: "Documentos" },
  { href: "/admin/leads", icon: Users, label: "Leads" },
  { href: "/admin/mensagens", icon: MessageSquare, label: "Mensagens" },
  { href: "/admin/relatorios", icon: TrendingUp, label: "Relatórios" },
  { href: "/admin/conteudo", icon: FileEdit, label: "Conteúdo do Site" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
]

export function AdminSidebar({ user: userProp }: { user?: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(userProp ?? null)

  useEffect(() => {
    if (userProp) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [userProp])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-foreground border-r border-foreground/20 flex flex-col text-background">
      {/* Logo */}
      <div className="p-5 border-b border-background/15">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/shark-fin-logo.png"
            alt="Shark Automotive"
            width={200}
            height={80}
            className="h-9 w-auto"
          />
        </Link>
        <span className="text-background/60 font-mono text-xs mt-2 block uppercase tracking-wider">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                isActive
                  ? "bg-background text-foreground font-medium"
                  : "text-background/70 hover:text-background hover:bg-background/10"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-background/15">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-background/15 flex items-center justify-center">
            <span className="text-background font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-background text-sm truncate font-medium">
              {user?.user_metadata?.full_name || user?.email || "Administrador"}
            </p>
            <p className="text-muted-foreground text-xs">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left text-background/70 hover:text-background hover:bg-background/10 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Terminar Sessão</span>
        </button>
      </div>
    </aside>
  )
}
