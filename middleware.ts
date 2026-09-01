import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const { pathname } = request.nextUrl
  const isMaintenancePage = pathname === '/maintenance'
  const isAdminRoute = pathname.startsWith('/admin')
  const isPublicAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico' || /\.[^/]+$/.test(pathname)

  // Maintenance mode: public visitors see only the maintenance page.
  // Admin routes remain available so the team can work and manage the site.
  if (!isMaintenancePage && !isAdminRoute && !isPublicAsset) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return Response.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
