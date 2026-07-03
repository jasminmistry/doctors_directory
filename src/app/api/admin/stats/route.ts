import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [clinics, practitioners, products, treatments, pendingClinics, pendingPractitioners, pendingUnlinkRequests] = await Promise.all([
      prisma.clinic.count(),
      prisma.practitioner.count(),
      prisma.product.count(),
      prisma.treatment.count(),
      prisma.pendingClinic.count({ where: { status: 'pending' } }),
      prisma.pendingPractitioner.count({ where: { status: 'pending' } }),
      prisma.clinic.count({ where: { coreUnlinkRequestedAt: { not: null } } }),
    ])
    return NextResponse.json({ clinics, practitioners, products, treatments, pendingClinics, pendingPractitioners, pendingUnlinkRequests })
  } catch (error) {
    console.error('Failed to get stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
