import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isRemovedClinicSlug, isRemovedPractitionerSlug } from '@/lib/directory-removals'

const COOKIE_TOKEN = 'consentz_token'
const COOKIE_REFRESH = 'consentz_refresh_token'
const COOKIE_ROLE = 'consentz_role'
const COOKIE_USERNAME = 'consentz_username'
const COOKIE_PATH = '/directory'

function clearAuthAndRedirect(request: NextRequest, pathname: string, loginPath: string) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = loginPath
  loginUrl.search = ''
  loginUrl.searchParams.set('next', pathname)
  const res = NextResponse.redirect(loginUrl)
  res.cookies.set(COOKIE_TOKEN, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_REFRESH, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_ROLE, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_USERNAME, '', { path: COOKIE_PATH, maxAge: 0 })
  return res
}

const PATIENT_COOKIE = 'patient_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const clinicProfileMatch = pathname.match(/^\/clinics\/[^/]+\/clinic\/([^/]+)\/?$/)
  if (clinicProfileMatch && isRemovedClinicSlug(decodeURIComponent(clinicProfileMatch[1]))) {
    return NextResponse.rewrite(new URL('/listing-removed', request.url))
  }

  const practitionerProfileMatch = pathname.match(/^\/practitioners\/[^/]+\/profile\/([^/]+)\/?$/)
  if (practitionerProfileMatch && isRemovedPractitionerSlug(decodeURIComponent(practitionerProfileMatch[1]))) {
    return NextResponse.rewrite(new URL('/listing-removed', request.url))
  }

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isPortalRoute = pathname.startsWith('/portal') || pathname.startsWith('/api/portal') || pathname.startsWith('/verify')
  const isAccountRoute = pathname.startsWith('/account') && pathname !== '/account/login' && pathname !== '/account/login/'
  const isPatientApiRoute = pathname.startsWith('/api/patient') && !pathname.startsWith('/api/patient/auth')
  const isAdminLoginPage = pathname === '/admin/login' || pathname === '/admin/login/'
  const isPortalLoginPage = pathname === '/portal/login' || pathname === '/portal/login/'
  const isAdminWrongAccountPage = pathname === '/admin/wrong-account' || pathname === '/admin/wrong-account/'
  const isPortalWrongAccountPage = pathname === '/portal/wrong-account' || pathname === '/portal/wrong-account/'

  if (isAdminLoginPage || isPortalLoginPage || isAdminWrongAccountPage || isPortalWrongAccountPage) {
    return NextResponse.next()
  }

  // Patient account + API routes — only require patient_session cookie
  if (isAccountRoute || isPatientApiRoute) {
    const patientSession = request.cookies.get(PATIENT_COOKIE)?.value
    if (!patientSession) {
      if (isPatientApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/account/login'
      loginUrl.search = ''
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_TOKEN)?.value
  const username = request.cookies.get(COOKIE_USERNAME)?.value

  // Admin routes proxy every action to Core with a bearer token, so consentz_token is
  // required. Portal auth (see getPortalUser()) is keyed on consentz_username + an approved
  // ClaimRequest — consentz_token is only needed by the Core-sync routes (calendar/bookings),
  // not by portal auth itself. A Consentz-link SSO login from a device-less web session
  // legitimately has no consentz_token but is still a valid portal session.
  if (isAdminRoute && !token) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return clearAuthAndRedirect(request, pathname, '/admin/login')
  }
  if (isPortalRoute && !username) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return clearAuthAndRedirect(request, pathname, '/portal/login')
  }
  if (!isAdminRoute && !isPortalRoute) {
    return NextResponse.next()
  }

  const role = request.cookies.get(COOKIE_ROLE)?.value

  if (isAdminRoute && role === 'portal') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const noticeUrl = request.nextUrl.clone()
    noticeUrl.pathname = '/admin/wrong-account'
    noticeUrl.search = ''
    noticeUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(noticeUrl)
  }

  if (isPortalRoute && role === 'admin') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const noticeUrl = request.nextUrl.clone()
    noticeUrl.pathname = '/portal/wrong-account'
    noticeUrl.search = ''
    noticeUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(noticeUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Note: Next.js matcher paths are relative to the app root, not the basePath
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/portal/:path*',
    '/api/portal/:path*',
    '/api/portal/upgrade',
    '/verify/:path*',
    '/portal/login',
    '/account/:path*',
    '/api/patient/:path*',
    '/clinics/:cityslug/clinic/:slug',
    '/practitioners/:cityslug/profile/:slug',
  ],
}
