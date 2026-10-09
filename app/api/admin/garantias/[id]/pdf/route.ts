import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/garantias/auth'
import { getGarantia, getVersao } from '@/lib/garantias/service'
import { renderGarantiaPdf } from '@/lib/garantias/render-pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// PDF de uma versão emitida, gerado a partir do snapshot congelado. ?versao=N (por defeito a atual).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAdminUser())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const g = await getGarantia(id)
    if (!g) return NextResponse.json({ error: 'Garantia não encontrada' }, { status: 404 })
    if (g.versao_atual === 0) return NextResponse.json({ error: 'Ainda não foi emitida.' }, { status: 409 })

    const pedido = Number(request.nextUrl.searchParams.get('versao') ?? g.versao_atual)
    const versao = Number.isInteger(pedido) ? await getVersao(id, pedido) : null
    if (!versao) return NextResponse.json({ error: 'Versão não encontrada' }, { status: 404 })

    const pdf = await renderGarantiaPdf(versao)
    const nome = `Garantia-${versao.dados.numero.replace(/[^A-Za-z0-9]+/g, '-')}-v${versao.versao}.pdf`
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${nome}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[garantias] pdf:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
