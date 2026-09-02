export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const user = await getPortalUser()
    if (!user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.clinicPresence.upsert({
      where: { clinicId: user.clinicId },
      create: { clinicId: user.clinicId, lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    })

    // Piggyback the GA4 client id so server-side Measurement Protocol events
    // (lead-unlock purchase, …) can attribute to this clinic's GA user.
    const gaClientId = await req
      .json()
      .then((b: { gaClientId?: unknown }) => (typeof b?.gaClientId === 'string' ? b.gaClientId.slice(0, 64) : null))
      .catch(() => null)
    if (gaClientId) {
      await prisma.clinic
        .update({ where: { id: user.clinicId }, data: { gaClientId } })
        .catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[portal/presence]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
