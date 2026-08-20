export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { clearPatientCookie } from '@/lib/patient-auth'
import { clearPortalCookies } from '@/lib/auth'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

// Patient and portal (clinic/practitioner) sessions are independent cookie sets that can
// coexist in the same browser (e.g. a clinic owner also testing the patient flow). Signing
// out as a patient must not leave a live portal session behind, so clear both here.
async function clearAllSessions(res: NextResponse) {
  const user = await getPortalUser().catch(() => null)

  clearPatientCookie(res)
  clearPortalCookies(res)

  if (user?.entityType === 'clinic' && user.clinicId) {
    await prisma.clinicPresence
      .deleteMany({ where: { clinicId: user.clinicId } })
      .catch((err) => console.error('[patient/auth/logout] failed to clear presence:', err))
  }
}

export async function POST() {
  const res = NextResponse.json({ ok: true })
  await clearAllSessions(res)
  return res
}

export async function GET(req: NextRequest) {
  const home = new URL('/directory', req.nextUrl.origin)
  const res = NextResponse.redirect(home)
  await clearAllSessions(res)
  return res
}
