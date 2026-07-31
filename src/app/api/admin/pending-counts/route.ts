import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [pendingClaims, pendingVerifications, pendingUnlinkRequests, pendingDirectoryRemovalRequests] =
      await Promise.all([
        prisma.claimRequest.count({ where: { status: 'pending_approval' } }),
        prisma.verificationRequest.count({ where: { status: 'pending' } }),
        prisma.clinic.count({ where: { coreUnlinkRequestedAt: { not: null } } }),
        prisma.clinic.count({ where: { directoryRemovalRequestedAt: { not: null } } }),
      ])

    return NextResponse.json({
      pendingClaims,
      pendingVerifications,
      pendingUnlinkRequests,
      pendingDirectoryRemovalRequests,
    })
  } catch {
    return NextResponse.json(
      { pendingClaims: 0, pendingVerifications: 0, pendingUnlinkRequests: 0, pendingDirectoryRemovalRequests: 0 },
      { status: 200 }
    )
  }
}
