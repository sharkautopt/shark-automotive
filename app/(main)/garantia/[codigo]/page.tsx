import type { Metadata } from 'next'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatDatePt } from '@/lib/garantias/format'
import { infoPublicaPorCodigo } from '@/lib/garantias/service'
import { COMPANY } from '@/lib/pdf/company'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Validar garantia | Shark Automotive',
  robots: { index: false, follow: false },
}

const ESTADOS = {
  emitida: { texto: 'Garantia válida', cls: 'text-green-400 border-green-400/40 bg-green-400/10', Icon: CheckCircle2 },
  assinada: { texto: 'Garantia válida', cls: 'text-green-400 border-green-400/40 bg-green-400/10', Icon: CheckCircle2 },
  expirada: { texto: 'Garantia expirada', cls: 'text-amber-400 border-amber-400/40 bg-amber-400/10', Icon: Clock },
  anulada: { texto: 'Garantia anulada', cls: 'text-red-400 border-red-400/40 bg-red-400/10', Icon: XCircle },
  rascunho: { texto: 'Garantia não encontrada', cls: 'text-red-400 border-red-400/40 bg-red-400/10', Icon: XCircle },
} as const

export default async function ValidarGarantiaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const info = await infoPublicaPorCodigo(codigo).catch(() => null)
  const estado = info ? ESTADOS[info.estado] : ESTADOS.rascunho

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-xl px-4 sm:px-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-primary uppercase mb-4">Validação de garantia</span>
            <div className={`flex items-center gap-3 border rounded-lg px-5 py-4 mb-8 ${estado.cls}`}>
              <estado.Icon className="w-6 h-6 shrink-0" />
              <span className="font-display text-2xl tracking-wide">{estado.texto.toUpperCase()}</span>
            </div>

            {info ? (
              <dl className="border border-border bg-card divide-y divide-border">
                {[
                  ['Número', info.numero],
                  ['Veículo', `${info.marca} ${info.modelo}`],
                  ['Prazo', `${info.prazo_meses} meses por mútuo acordo`],
                  ['Válida de', formatDatePt(info.data_inicio)],
                  ['Válida até', formatDatePt(info.data_fim)],
                  ['Versão do documento', String(info.versao)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-6 px-5 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                    <dd className="text-foreground text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted-foreground">
                Não encontrámos nenhuma garantia com este código. Confirma o código impresso no documento ou contacta-nos.
              </p>
            )}

            <p className="text-muted-foreground/70 text-sm mt-8 leading-relaxed">
              Esta página confirma a existência e a validade da garantia e não mostra dados pessoais. Dúvidas:{' '}
              <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">{COMPANY.email}</a> · {COMPANY.phone}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
