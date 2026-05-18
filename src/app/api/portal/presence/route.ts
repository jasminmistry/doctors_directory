export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function POST() {
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

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[portal/presence]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
