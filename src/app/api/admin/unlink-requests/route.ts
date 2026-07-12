import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { coreUnlinkRequestedAt: { not: null } },
      select: {
        slug: true,
        name: true,
        image: true,
        email: true,
        coreClinicId: true,
        coreUnlinkRequestedAt: true,
        isHidden: true,
        practitionerAssociations: {
          select: {
            practitioner: {
              select: { slug: true, displayName: true, imageUrl: true, isHidden: true },
            },
          },
        },
      },
      orderBy: { coreUnlinkRequestedAt: 'asc' },
    })

    return NextResponse.json(
      clinics.map((c) => ({
        ...c,
        practitioners: c.practitionerAssociations.map((a) => a.practitioner),
        practitionerAssociations: undefined,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch unlink requests:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
