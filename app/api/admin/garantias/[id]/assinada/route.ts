import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'
import { getAdminUser } from '@/lib/garantias/auth'
import { getGarantia, marcarAssinada } from '@/lib/garantias/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 4 * 1024 * 1024 // limite do corpo de uma função na Vercel é ~4,5 MB
const TIPOS: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }

// POST: carrega o scan da via assinada e marca a garantia como assinada.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAdminUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const g = await getGarantia(id)
    if (!g || !g.numero) return NextResponse.json({ error: 'Garantia não encontrada' }, { status: 404 })
    if (g.estado !== 'emitida' && g.estado !== 'assinada') {
      return NextResponse.json({ error: 'Só se marcam como assinadas garantias emitidas.' }, { status: 409 })
    }

    const form = await request.formData()
    const file = form.get('ficheiro')
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'Escolhe o ficheiro da via assinada.' }, { status: 400 })
    const ext = TIPOS[file.type]
    if (!ext) return NextResponse.json({ error: 'Formato inválido: usa PDF, JPG ou PNG.' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Ficheiro demasiado grande (máx. 4 MB).' }, { status: 413 })

    const path = `garantias/${g.numero.replace(/[^A-Za-z0-9]+/g, '-')}-assinada-v${g.versao_atual}-${Date.now()}.${ext}`
    const { error: upErr } = await supabaseAdmin.storage
      .from('documents')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (upErr) return NextResponse.json({ error: `Falha ao guardar o ficheiro: ${upErr.message}` }, { status: 500 })

    await marcarAssinada(id, path, user)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[garantias] assinada POST:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: abre o scan da via assinada (link temporário de 5 minutos).
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAdminUser())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const g = await getGarantia(id)
    if (!g?.assinada_ficheiro) return NextResponse.json({ error: 'Sem via assinada carregada.' }, { status: 404 })
    const { data, error } = await supabaseAdmin.storage.from('documents').createSignedUrl(g.assinada_ficheiro, 300)
    if (error || !data?.signedUrl) return NextResponse.json({ error: error?.message ?? 'Link indisponível' }, { status: 500 })
    return NextResponse.redirect(data.signedUrl)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
