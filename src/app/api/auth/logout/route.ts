import { NextResponse } from 'next/server'
import { COOKIE_TOKEN, COOKIE_REFRESH, COOKIE_USERNAME, COOKIE_ROLE, COOKIE_ACTIVE_CLINIC, COOKIE_PATH } from '@/lib/auth'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function POST() {
  // Resolve before clearing cookies — getPortalUser needs consentz_username to still be set.
  const user = await getPortalUser().catch(() => null)

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_TOKEN, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_REFRESH, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_USERNAME, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_ROLE, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_ACTIVE_CLINIC, '', { path: COOKIE_PATH, maxAge: 0 })

  if (user?.entityType === 'clinic' && user.clinicId) {
    await prisma.clinicPresence
      .deleteMany({ where: { clinicId: user.clinicId } })
      .catch((err) => console.error('[auth/logout] failed to clear presence:', err))
  }

  return response
}
