import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { GarantiaBadge } from '@/components/admin/garantia-badge'
import { aExpirar, diasAte, estadoEfetivo, hojeLisboa, ALERTA_DIAS } from '@/lib/garantias/dates'
import { formatDatePt } from '@/lib/garantias/format'
import { listarGarantias } from '@/lib/garantias/service'
import type { Garantia } from '@/lib/garantias/types'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

type Search = { estado?: string; q?: string; de?: string; ate?: string }

function filtrar(todas: Garantia[], { estado, q, de, ate }: Search, hoje: string): Garantia[] {
  const termo = q ? norm(q.trim()) : ''
  return todas.filter((g) => {
    if (estado === 'a_expirar') {
      if (!aExpirar(g, hoje)) return false
    } else if (estado && estadoEfetivo(g, hoje) !== estado) return false
    if (termo) {
      const alvo = norm([g.numero, g.cliente_nome, g.cliente_nif, g.viatura_marca, g.viatura_modelo, g.viatura_matricula, g.viatura_vin].filter(Boolean).join(' '))
      if (!alvo.includes(termo)) return false
    }
    if (de && (!g.data_venda || g.data_venda < de)) return false
    if (ate && (!g.data_venda || g.data_venda > ate)) return false
    return true
  })
}

const inputClass = 'bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary focus:outline-none'

export default async function GarantiasPage({ searchParams }: { searchParams: Promise<Search> }) {
  await checkAdmin()
  const sp = await searchParams
  const hoje = hojeLisboa()

  let todas: Garantia[] = []
  let erro: string | null = null
  try {
    todas = await listarGarantias()
  } catch (e) {
    erro = /does not exist|schema cache/i.test(String(e)) ? 'Falta correr a migração 005_garantias.sql no Supabase.' : String(e instanceof Error ? e.message : e)
  }

  const lista = filtrar(todas, sp, hoje)
  const aExpirarCount = todas.filter((g) => aExpirar(g, hoje)).length

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl text-foreground">GARANTIAS</h1>
              <p className="text-muted-foreground/60 mt-1">
                {todas.length} no total · criam-se a partir da operação do cliente (separador Documentos)
              </p>
            </div>
            <Link href="/admin/garantias/templates" className="border border-primary/30 text-foreground px-4 py-2.5 rounded-lg hover:bg-secondary/50 text-sm">
              Templates
            </Link>
          </div>

          {erro && <p className="text-red-400 border border-red-400/30 bg-red-400/10 rounded-lg px-4 py-3 text-sm">{erro}</p>}

          {aExpirarCount > 0 && sp.estado !== 'a_expirar' && (
            <Link href="/admin/garantias?estado=a_expirar" className="flex items-center gap-3 border border-amber-500/40 bg-amber-500/10 text-amber-300 rounded-lg px-4 py-3 text-sm hover:bg-amber-500/15">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {aExpirarCount} {aExpirarCount === 1 ? 'garantia termina' : 'garantias terminam'} nos próximos {ALERTA_DIAS} dias — ver
            </Link>
          )}

          <form method="get" className="flex flex-wrap items-end gap-3 bg-secondary/30 border border-primary/10 rounded-xl p-4">
            <div>
              <label className="block text-muted-foreground/60 font-mono text-[10px] uppercase mb-1">Estado</label>
              <select name="estado" defaultValue={sp.estado ?? ''} className={inputClass}>
                <option value="">Todos</option>
                <option value="rascunho">Rascunho</option>
                <option value="emitida">Emitida</option>
                <option value="assinada">Assinada</option>
                <option value="expirada">Expirada</option>
                <option value="anulada">Anulada</option>
                <option value="a_expirar">A expirar (≤ {ALERTA_DIAS} dias)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-muted-foreground/60 font-mono text-[10px] uppercase mb-1">Cliente, viatura, matrícula, VIN ou número</label>
              <input name="q" defaultValue={sp.q ?? ''} className={`${inputClass} w-full`} placeholder="Pesquisar" />
            </div>
            <div>
              <label className="block text-muted-foreground/60 font-mono text-[10px] uppercase mb-1">Venda de</label>
              <input type="date" name="de" defaultValue={sp.de ?? ''} className={inputClass} />
            </div>
            <div>
              <label className="block text-muted-foreground/60 font-mono text-[10px] uppercase mb-1">até</label>
              <input type="date" name="ate" defaultValue={sp.ate ?? ''} className={inputClass} />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Filtrar</button>
            {(sp.estado || sp.q || sp.de || sp.ate) && (
              <Link href="/admin/garantias" className="text-muted-foreground/60 hover:text-foreground text-sm py-2">Limpar</Link>
            )}
          </form>

          <div className="bg-secondary/30 border border-primary/10 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 text-muted-foreground/60 font-mono text-xs uppercase">
                  <th className="p-4">Número</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Viatura</th>
                  <th className="p-4">Venda</th>
                  <th className="p-4">Termo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Ver</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground/50">Nenhuma garantia encontrada.</td></tr>
                ) : (
                  lista.map((g) => {
                    const expira = aExpirar(g, hoje)
                    return (
                      <tr key={g.id} className="border-b border-primary/5 hover:bg-background/40 transition-colors">
                        <td className="p-4 font-mono text-sm text-foreground">
                          <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4 text-primary/60" />{g.numero ?? '—'}</span>
                        </td>
                        <td className="p-4 text-foreground">{g.cliente_nome || '—'}</td>
                        <td className="p-4 text-muted-foreground/80">
                          {[g.viatura_marca, g.viatura_modelo].filter(Boolean).join(' ') || '—'}
                          <span className="block text-muted-foreground/50 text-xs">{g.viatura_matricula}</span>
                        </td>
                        <td className="p-4 text-muted-foreground/70 text-sm">{formatDatePt(g.data_venda)}</td>
                        <td className="p-4 text-sm">
                          <span className={expira ? 'text-amber-400' : 'text-muted-foreground/70'}>{formatDatePt(g.data_fim)}</span>
                          {expira && g.data_fim && (
                            <span className="flex items-center gap-1 text-amber-400 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              {diasAte(g.data_fim, hoje) === 0 ? 'termina hoje' : `faltam ${diasAte(g.data_fim, hoje)} dias`}
                            </span>
                          )}
                        </td>
                        <td className="p-4"><GarantiaBadge estado={estadoEfetivo(g, hoje)} /></td>
                        <td className="p-4 text-right"><Link href={`/admin/garantias/${g.id}`} className="text-primary">Abrir</Link></td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
