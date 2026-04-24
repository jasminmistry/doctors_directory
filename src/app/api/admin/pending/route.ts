import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [pendingClinics, pendingPractitioners] = await Promise.all([
      prisma.pendingClinic.findMany({ where: { status: 'pending' }, orderBy: { submittedAt: 'desc' } }),
      prisma.pendingPractitioner.findMany({ where: { status: 'pending' }, orderBy: { submittedAt: 'desc' } }),
    ])

    const clinics = pendingClinics.map((r) => ({
      ...JSON.parse(r.submittedData),
      _pendingId: r.id,
      _type: 'clinic',
    }))

    const practitioners = pendingPractitioners.map((r) => ({
      ...JSON.parse(r.submittedData),
      _pendingId: r.id,
      _type: 'practitioner',
    }))

    return NextResponse.json([...clinics, ...practitioners])
  } catch (error) {
    console.error('Failed to read pending:', error)
    return NextResponse.json({ error: 'Failed to read pending' }, { status: 500 })
  }
}
