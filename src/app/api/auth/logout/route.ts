import { NextResponse } from 'next/server'
import { clearPortalCookies } from '@/lib/auth'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function POST() {
  // Resolve before clearing cookies — getPortalUser needs consentz_username to still be set.
  const user = await getPortalUser().catch(() => null)

  const response = NextResponse.json({ success: true })
  clearPortalCookies(response)

  if (user?.entityType === 'clinic' && user.clinicId) {
    await prisma.clinicPresence
      .deleteMany({ where: { clinicId: user.clinicId } })
      .catch((err) => console.error('[auth/logout] failed to clear presence:', err))
  }

  return response
}
