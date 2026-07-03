import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { sendUnlinkRequestNotification } from '@/lib/email'

export async function POST() {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'clinic' || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { name: true, slug: true, coreClinicId: true, coreUnlinkRequestedAt: true },
  })

  if (!clinic?.coreClinicId) {
    return NextResponse.json({ error: 'No Core account is linked to this clinic' }, { status: 400 })
  }

  if (clinic.coreUnlinkRequestedAt) {
    return NextResponse.json({ error: 'An unlink request is already pending' }, { status: 409 })
  }

  const requestedAt = new Date()
  await prisma.clinic.update({
    where: { id: user.clinicId },
    data: { coreUnlinkRequestedAt: requestedAt },
  })

  sendUnlinkRequestNotification({
    clinicName: clinic.name ?? clinic.slug,
    clinicSlug: clinic.slug,
    coreClinicId: clinic.coreClinicId,
    requestedAt,
  }).catch((err) => console.error('Failed to send unlink notification email:', err))

  return NextResponse.json({ ok: true })
}
