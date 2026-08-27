import { NextResponse } from 'next/server'
import {
  COOKIE_TOKEN,
  COOKIE_REFRESH,
  COOKIE_USERNAME,
  COOKIE_ROLE,
  COOKIE_OPTS,
  consentzApi,
  extractTokens,
  isAdminUsername,
} from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    let res: Response
    try {
      res = await consentzApi('/login', {
        method: 'POST',
        body: { username, password, confirmLogin: true },
      })
    } catch {
      return NextResponse.json({ error: 'Auth service not configured' }, { status: 500 })
    }

    const data = await res.json()

    if (!res.ok || data.error) {
      const message = data.error?.message || 'Invalid credentials'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    const { token, refreshToken } = extractTokens(data)

    const isAdmin = isAdminUsername(username)
    const claims = isAdmin
      ? []
      : await prisma.claimRequest.findMany({
          where: { consentzUsername: username },
          select: {
            status: true,
            clinic: { select: { scheduledDeletionAt: true } },
            practitioner: { select: { scheduledDeletionAt: true } },
          },
        })

    if (!isAdmin && claims.length === 0) {
      return NextResponse.json({ error: 'You do not have access to this application' }, { status: 403 })
    }

    // A claim can be 'approved' yet still unusable — the underlying clinic/practitioner is
    // mid-deletion (grace period) or already purged (status flips to 'deleted', see
    // purgeClinicDeletion/purgePractitionerDeletion in src/lib/account-deletion.ts). Core auth
    // itself has no concept of this, so without this check the login would otherwise succeed,
    // only to silently bounce back from the portal layout's getPortalUser() === null redirect.
    if (!isAdmin) {
      const hasUsableClaim = claims.some(
        (c) => c.status === 'approved' && !c.clinic?.scheduledDeletionAt && !c.practitioner?.scheduledDeletionAt,
      )
      if (!hasUsableClaim) {
        if (claims.every((c) => c.status === 'deleted')) {
          return NextResponse.json(
            { error: 'This account has been deleted and is no longer available.' },
            { status: 403 },
          )
        }
        if (claims.some((c) => c.status === 'approved' && (c.clinic?.scheduledDeletionAt || c.practitioner?.scheduledDeletionAt))) {
          return NextResponse.json(
            {
              error:
                'This account is scheduled for deletion. Check your email for a link to cancel within the 7-day grace period, or contact support.',
            },
            { status: 403 },
          )
        }
      }
    }

    const role = isAdmin ? 'admin' : 'portal'

    const response = NextResponse.json({ success: true, role })
    response.cookies.set(COOKIE_TOKEN, token, COOKIE_OPTS)
    response.cookies.set(COOKIE_USERNAME, username, COOKIE_OPTS)
    response.cookies.set(COOKIE_ROLE, role, COOKIE_OPTS)
    if (refreshToken) {
      response.cookies.set(COOKIE_REFRESH, refreshToken, COOKIE_OPTS)
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
