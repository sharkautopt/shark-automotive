import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPageAllContent, updatePageContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

// GET /api/admin/content?page=home  -> all content rows for a page
export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page')
  if (!page) {
    return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 })
  }

  const rows = await getPageAllContent(page)
  return NextResponse.json({ content: rows })
}

// POST /api/admin/content  -> save an array of { section, content_key, value }
export async function POST(request: NextRequest) {
  // Verify the requester is an authenticated admin (session cookie)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: {
    page?: string
    changes?: Array<{ section: string; content_key: string; value: string }>
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { page, changes } = body
  if (!page || !Array.isArray(changes) || changes.length === 0) {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 })
  }

  const results: Array<{ key: string; ok: boolean }> = []
  for (const change of changes) {
    const ok = await updatePageContent(
      page,
      change.section,
      change.content_key,
      change.value,
      user.id,
      'Admin CMS edit'
    )
    results.push({ key: `${change.section}/${change.content_key}`, ok })
  }

  const failed = results.filter((r) => !r.ok)
  if (failed.length > 0) {
    return NextResponse.json(
      { error: 'Algumas alterações falharam', failed },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, saved: results.length })
}
