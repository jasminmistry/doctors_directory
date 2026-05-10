import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_TOKEN = 'consentz_token'
const COOKIE_REFRESH = 'consentz_refresh_token'
const COOKIE_ROLE = 'consentz_role'
const COOKIE_PATH = '/directory'

function clearAuthAndRedirect(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', pathname)
  const res = NextResponse.redirect(loginUrl)
  res.cookies.set(COOKIE_TOKEN, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_REFRESH, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_ROLE, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set('consentz_username', '', { path: COOKIE_PATH, maxAge: 0 })
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isPortalRoute = pathname.startsWith('/portal') || pathname.startsWith('/api/portal') || pathname.startsWith('/verify')
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/'

  if (isLoginPage) return NextResponse.next()

  const token = request.cookies.get(COOKIE_TOKEN)?.value

  if (!token) {
    if (isAdminRoute || isPortalRoute) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return clearAuthAndRedirect(request, pathname)
    }
    return NextResponse.next()
  }

  const role = request.cookies.get(COOKIE_ROLE)?.value

  if (isAdminRoute && role === 'portal') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const portalUrl = request.nextUrl.clone()
    portalUrl.pathname = '/portal'
    portalUrl.search = ''
    return NextResponse.redirect(portalUrl)
  }

  if (isPortalRoute && role === 'admin') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    adminUrl.search = ''
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Note: Next.js matcher paths are relative to the app root, not the basePath
  matcher: ['/admin/:path*', '/api/admin/:path*', '/portal/:path*', '/api/portal/:path*', '/api/portal/upgrade', '/verify/:path*'],
}
