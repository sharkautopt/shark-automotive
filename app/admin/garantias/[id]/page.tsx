import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { GarantiaBadge } from '@/components/admin/garantia-badge'
import { GarantiaForm } from '@/components/admin/garantia-form'
import { GarantiaAcoes } from '@/components/admin/garantia-actions'
import { aExpirar, diasAte, estadoEfetivo, hojeLisboa } from '@/lib/garantias/dates'
import { formatDatePt, formatEuroPt, formatKmPt } from '@/lib/garantias/format'
import { getEventos, getGarantia, getVersoes, listTemplates } from '@/lib/garantias/service'
import type { GarantiaEventoTipo } from '@/lib/garantias/types'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (user.user_metadata?.is_admin !== true) redirect('/admin/login?error=unauthorized')
}

const EVENTO: Record<GarantiaEventoTipo, string> = {
  criada: 'Criada',
  editada: 'Rascunho editado',
  emitida: 'Emitida',
  nova_versao: 'Nova versão emitida',
  enviada: 'Enviada por email',
  envio_falhado: 'Envio por email falhou',
  assinada: 'Marcada como assinada',
  anulada: 'Anulada',
}

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function Par({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-muted-foreground/50 font-mono text-[10px] uppercase">{k}</dt>
      <dd className="text-foreground">{v || '—'}</dd>
    </div>
  )
}

export default async function GarantiaPage({ params }: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await params
  const g = await getGarantia(id)
  if (!g) notFound()

  const [templates, versoes, eventos] = await Promise.all([listTemplates(), getVersoes(id), getEventos(id)])
  const { data: op } = await supabaseAdmin.from('operations').select('id, profile_id').eq('id', g.operation_id).maybeSingle()
  const { data: perfil } = op ? await supabaseAdmin.from('profiles').select('email').eq('id', op.profile_id).maybeSingle() : { data: null }

  const hoje = hojeLisboa()
  const efetivo = estadoEfetivo(g, hoje)
  const expira = aExpirar(g, hoje)
  const ativos = templates.filter((t) => t.ativo || t.id === g.template_id)

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="space-y-8 max-w-5xl">
          <div>
            <Link href="/admin/garantias" className="inline-flex items-center gap-2 text-muted-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Voltar às garantias
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="font-display text-4xl text-foreground">{g.numero ?? 'GARANTIA'}</h1>
              <GarantiaBadge estado={efetivo} />
              {g.versao_atual > 0 && <span className="font-mono text-xs text-muted-foreground/60">versão {g.versao_atual}</span>}
            </div>
            <p className="text-muted-foreground/60 mt-1">
              {g.cliente_nome} · {[g.viatura_marca, g.viatura_modelo].filter(Boolean).join(' ')}
              {' · '}
              <Link href={`/admin/operacoes/${g.operation_id}`} className="text-primary hover:underline">ver operação</Link>
            </p>
          </div>

          {expira && g.data_fim && (
            <div className="flex items-center gap-3 border border-amber-500/40 bg-amber-500/10 text-amber-300 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Termina em {formatDatePt(g.data_fim)} ({diasAte(g.data_fim, hoje) === 0 ? 'hoje' : `faltam ${diasAte(g.data_fim, hoje)} dias`}).
            </div>
          )}
          {g.estado === 'anulada' && (
            <div className="border border-red-400/30 bg-red-400/10 text-red-300 rounded-lg px-4 py-3 text-sm">
              Anulada em {g.anulada_em ? dataHora(g.anulada_em) : ''}. Motivo: {g.anulada_motivo}
            </div>
          )}

          {g.estado === 'rascunho' ? (
            <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6 space-y-8">
              <GarantiaForm garantia={g} templates={ativos} mode="rascunho" />
              <div className="border-t border-primary/10 pt-6">
                <GarantiaAcoes garantia={g} templates={ativos} emailSugerido={perfil?.email ?? ''} />
              </div>
            </div>
          ) : (
            <>
              <div className="bg-secondary/30 border border-primary/10 rounded-xl p-6 space-y-6">
                <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <Par k="Cliente" v={g.cliente_nome} />
                  <Par k="NIF" v={g.cliente_nif ?? ''} />
                  <Par k="Morada" v={g.cliente_morada ?? ''} />
                  <Par k="Viatura" v={[g.viatura_marca, g.viatura_modelo].filter(Boolean).join(' ')} />
                  <Par k="Matrícula" v={g.viatura_matricula ?? ''} />
                  <Par k="VIN" v={g.viatura_vin ?? ''} />
                  <Par k="Km na venda" v={g.viatura_km != null ? `${formatKmPt(g.viatura_km)} km` : ''} />
                  <Par k="Venda" v={`${formatDatePt(g.data_venda)} · ${formatEuroPt(g.valor_venda)}`} />
                  <Par k="Vigência" v={`${formatDatePt(g.data_inicio)} → ${formatDatePt(g.data_fim)} (${g.prazo_meses} meses)`} />
                  <Par k="Cobertos" v={g.componentes_cobertos.join(', ')} />
                  <Par k="Exclusões" v={g.exclusoes.join(', ')} />
                  <Par k="Via assinada" v={g.assinada_em ? `${dataHora(g.assinada_em)} (versão ${g.assinada_versao})` : 'Ainda não carregada'} />
                </dl>
                <p className="text-muted-foreground/50 text-xs border-t border-primary/10 pt-4">
                  Campos bloqueados: o documento emitido não se edita. Para alterar algo, cria uma nova versão (fica registada).
                </p>
                <GarantiaAcoes garantia={g} templates={ativos} emailSugerido={perfil?.email ?? ''} />
              </div>

              <section className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
                <h2 className="font-display text-2xl text-foreground mb-4">VERSÕES</h2>
                <ul className="divide-y divide-primary/10">
                  {versoes.map((v) => (
                    <li key={v.id} className="py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                      <span className="font-mono text-foreground">v{v.versao}</span>
                      <span className="text-muted-foreground/70">{dataHora(v.created_at)}</span>
                      <span className="text-muted-foreground/70">{v.criado_por_email ?? '—'}</span>
                      <span className="text-muted-foreground/50 flex-1 min-w-[160px]">{v.motivo ?? (v.versao === 1 ? 'Emissão inicial' : '')}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/40" title={v.hash_sha256}>#{v.hash_sha256.slice(0, 12)}</span>
                      <a href={`/api/admin/garantias/${g.id}/pdf?versao=${v.versao}`} target="_blank" rel="noopener noreferrer" className="text-primary">PDF</a>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <section className="bg-secondary/30 border border-primary/10 rounded-xl p-6">
            <h2 className="font-display text-2xl text-foreground mb-4">HISTÓRICO</h2>
            <ul className="space-y-3">
              {eventos.map((e) => (
                <li key={e.id} className="text-sm flex flex-wrap gap-x-4">
                  <span className="text-muted-foreground/50 font-mono text-xs w-36 shrink-0">{dataHora(e.created_at)}</span>
                  <span className="text-foreground">{EVENTO[e.tipo]}{e.versao ? ` (v${e.versao})` : ''}</span>
                  <span className="text-muted-foreground/60">{e.user_email}</span>
                  {typeof e.detalhes?.motivo === 'string' && e.detalhes.motivo && <span className="text-muted-foreground/60">— {e.detalhes.motivo}</span>}
                  {typeof e.detalhes?.para === 'string' && <span className="text-muted-foreground/60">→ {e.detalhes.para}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
