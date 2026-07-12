import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [clinics, practitioners, products, treatments, pendingClaims, pendingUnlinkRequests] = await Promise.all([
      prisma.clinic.count(),
      prisma.practitioner.count(),
      prisma.product.count(),
      prisma.treatment.count(),
      prisma.claimRequest.count({ where: { status: 'pending_approval' } }),
      prisma.clinic.count({ where: { coreUnlinkRequestedAt: { not: null } } }),
    ])
    return NextResponse.json({ clinics, practitioners, products, treatments, pendingClaims, pendingUnlinkRequests })
  } catch (error) {
    console.error('Failed to get stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
