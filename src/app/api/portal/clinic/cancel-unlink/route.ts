import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export async function POST() {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'clinic' || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.clinic.update({
    where: { id: user.clinicId },
    data: { coreUnlinkRequestedAt: null },
  })

  return NextResponse.json({ ok: true })
}
