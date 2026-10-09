import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/garantias/auth'
import { getGarantia, getVersao, registarEvento } from '@/lib/garantias/service'
import { renderGarantiaPdf } from '@/lib/garantias/render-pdf'
import { validationUrl } from '@/lib/garantias/template'
import { formatDatePt } from '@/lib/garantias/format'
import { emailGarantia } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Envia (ou reenvia) a versão atual ao cliente, com o PDF em anexo. Só fica "enviada" no histórico se o envio correu bem.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAdminUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as { para?: string }
    const para = (body.para ?? '').trim()
    if (!EMAIL_RE.test(para)) return NextResponse.json({ error: 'Email de destino inválido.' }, { status: 400 })

    const g = await getGarantia(id)
    if (!g) return NextResponse.json({ error: 'Garantia não encontrada' }, { status: 404 })
    if (g.estado === 'rascunho' || g.estado === 'anulada') {
      return NextResponse.json({ error: 'Só se enviam garantias emitidas.' }, { status: 409 })
    }
    const versao = await getVersao(id, g.versao_atual)
    if (!versao) return NextResponse.json({ error: 'Versão não encontrada' }, { status: 404 })

    const pdf = await renderGarantiaPdf(versao)
    const res = await emailGarantia(
      para,
      {
        numero: versao.dados.numero,
        versao: versao.versao,
        clienteNome: versao.dados.cliente.nome,
        dataFim: formatDatePt(versao.dados.garantia.data_fim),
        urlValidacao: validationUrl(versao.dados.codigo_verificacao),
      },
      pdf,
    )

    if (res.skipped || res.error) {
      const motivo = res.skipped ? 'RESEND_API_KEY não está configurada no servidor.' : (res.error ?? 'Erro desconhecido')
      await registarEvento(id, 'envio_falhado', user, { versao: versao.versao, detalhes: { para, motivo } })
      return NextResponse.json({ error: `Email não enviado: ${motivo}` }, { status: 502 })
    }

    await registarEvento(id, 'enviada', user, { versao: versao.versao, detalhes: { para, resend_id: res.id ?? null } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[garantias] enviar:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
