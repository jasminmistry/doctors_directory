import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where =
    user.entityType === 'clinic'
      ? { clinicId: user.clinicId!, status: 'approved' as const }
      : { practitionerId: user.practitionerId!, status: 'approved' as const }

  const claim = await prisma.claimRequest.findFirst({
    where,
    select: { scheduleWizardDone: true, consentzUserId: true, consentzClinicId: true },
    orderBy: { approvedAt: 'desc' },
  })

  const hasConsentzId =
    user.entityType === 'practitioner'
      ? (claim?.consentzUserId ?? null) !== null
      : (claim?.consentzClinicId ?? null) !== null

  return NextResponse.json({
    done: claim?.scheduleWizardDone ?? false,
    hasConsentzId,
  })
}

export async function POST() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where =
    user.entityType === 'clinic'
      ? { clinicId: user.clinicId!, status: 'approved' as const }
      : { practitionerId: user.practitionerId!, status: 'approved' as const }

  const claim = await prisma.claimRequest.findFirst({
    where,
    select: { id: true },
    orderBy: { approvedAt: 'desc' },
  })

  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

  await prisma.claimRequest.update({
    where: { id: claim.id },
    data: { scheduleWizardDone: true },
  })

  return NextResponse.json({ done: true })
}
