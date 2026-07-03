import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [pendingClinics, pendingPractitioners, pendingClaims, pendingVerifications, pendingUnlinkRequests] =
      await Promise.all([
        prisma.pendingClinic.count({ where: { status: 'pending' } }),
        prisma.pendingPractitioner.count({ where: { status: 'pending' } }),
        prisma.claimRequest.count({ where: { status: 'pending_approval' } }),
        prisma.verificationRequest.count({ where: { status: 'pending' } }),
        prisma.clinic.count({ where: { coreUnlinkRequestedAt: { not: null } } }),
      ])

    return NextResponse.json({
      pendingClinics,
      pendingPractitioners,
      pendingClaims,
      pendingVerifications,
      pendingUnlinkRequests,
    })
  } catch {
    return NextResponse.json(
      { pendingClinics: 0, pendingPractitioners: 0, pendingClaims: 0, pendingVerifications: 0, pendingUnlinkRequests: 0 },
      { status: 200 }
    )
  }
}
