import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      pendingClaims,
      pendingVerifications,
      pendingUnlinkRequests,
      pendingDirectoryRemovalRequests,
      pendingClinicDeletions,
      pendingPractitionerDeletions,
    ] = await Promise.all([
      prisma.claimRequest.count({ where: { status: 'pending_approval' } }),
      prisma.verificationRequest.count({ where: { status: 'pending' } }),
      prisma.clinic.count({ where: { coreUnlinkRequestedAt: { not: null } } }),
      prisma.clinic.count({ where: { directoryRemovalRequestedAt: { not: null } } }),
      prisma.clinic.count({ where: { scheduledDeletionAt: { not: null } } }),
      prisma.practitioner.count({ where: { scheduledDeletionAt: { not: null } } }),
    ])

    return NextResponse.json({
      pendingClaims,
      pendingVerifications,
      pendingUnlinkRequests,
      pendingDirectoryRemovalRequests,
      pendingAccountDeletions: pendingClinicDeletions + pendingPractitionerDeletions,
    })
  } catch {
    return NextResponse.json(
      {
        pendingClaims: 0,
        pendingVerifications: 0,
        pendingUnlinkRequests: 0,
        pendingDirectoryRemovalRequests: 0,
        pendingAccountDeletions: 0,
      },
      { status: 200 }
    )
  }
}
