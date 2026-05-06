import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_TOKEN = 'consentz_token'
const COOKIE_REFRESH = 'consentz_refresh_token'
const COOKIE_PATH = '/directory'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: COOKIE_PATH,
}

function clearAuthAndRedirect(request: NextRequest, pathname: string) {
  const loginUrl = new URL(request.url)
  loginUrl.pathname = '/directory/admin/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', pathname)
  const res = NextResponse.redirect(loginUrl)
  res.cookies.set(COOKIE_TOKEN, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_REFRESH, '', { path: COOKIE_PATH, maxAge: 0 })
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isApiRoute = pathname.startsWith('/api/admin')
  const isLoginPage =
    pathname === '/admin/login' ||
    pathname === '/admin/login/' ||
    pathname === '/directory/admin/login' ||
    pathname === '/directory/admin/login/'

  if (isLoginPage) return NextResponse.next()

  const token = request.cookies.get(COOKIE_TOKEN)?.value

  if (!token) {
    if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return clearAuthAndRedirect(request, pathname)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
