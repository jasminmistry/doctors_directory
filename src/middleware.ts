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
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', pathname)
  const res = NextResponse.redirect(loginUrl)
  res.cookies.delete(COOKIE_TOKEN)
  res.cookies.delete(COOKIE_REFRESH)
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith('/api/admin')
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/'

  if (isLoginPage) return NextResponse.next()

  const token = request.cookies.get(COOKIE_TOKEN)?.value
  const refreshToken = request.cookies.get(COOKIE_REFRESH)?.value

  if (!token) {
    // No session token — try refresh if we have a refresh token
    if (refreshToken) {
      try {
        const authApiUrl = process.env.CONSENTZ_AUTH_API_URL
        const appId = process.env.CONSENTZ_APPLICATION_ID || 'admin'

        const refreshRes = await fetch(`${authApiUrl}/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-APPLICATION-ID': appId },
          body: JSON.stringify({ refreshToken }),
        })

        if (!refreshRes.ok) throw new Error('refresh failed')
        const data = await refreshRes.json()
        if (data.error) throw new Error(data.error.message)

        const response = NextResponse.next()
        response.cookies.set(COOKIE_TOKEN, data.user.sessionToken, COOKIE_OPTS)
        response.cookies.set(COOKIE_REFRESH, data.user.refreshToken, COOKIE_OPTS)
        return response
      } catch {
        if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        return clearAuthAndRedirect(request, pathname)
      }
    }

    if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return clearAuthAndRedirect(request, pathname)
  }

  return NextResponse.next()
}

export const config = {
  // Note: Next.js matcher paths are relative to the app root, not the basePath
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
