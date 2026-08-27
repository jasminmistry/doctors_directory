import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_TOKEN, consentzApi } from '@/lib/auth'

/**
 * Consentz session tokens for admin accounts expire after 1 hour of inactivity
 * (a sliding TTL, extended on every authenticated Consentz call). Most of the
 * admin panel never calls Consentz with the reviewing admin's own token at all —
 * only claim approval/reprovisioning does — so on an ordinary admin session the
 * token quietly goes stale in the background and the next Core-touching action
 * fails. AdminLayout pings this on an interval (and once on load) for every admin
 * page, so the token stays alive for as long as any admin page is open, and a
 * stale/dead token is surfaced up front instead of discovered mid-action.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_TOKEN)?.value
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const res = await consentzApi('/check-token', { method: 'POST', sessionToken: token })
    if (res.status === 204) {
      return NextResponse.json({ ok: true })
    }
    // Consentz's ApiException handler currently returns HTTP 200 even for an
    // invalid/expired token — the real status only shows up as `error.code` in the
    // body, so a 200 alone isn't proof the token is still valid.
    const data: { error?: unknown } = await res.json().catch(() => ({}))
    return NextResponse.json({ ok: res.ok && !data.error })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
