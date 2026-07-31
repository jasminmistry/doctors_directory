import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { directoryRemovalRequestedAt: { not: null } },
      select: {
        slug: true,
        name: true,
        image: true,
        email: true,
        directoryRemovalRequestedAt: true,
        isHidden: true,
        practitionerAssociations: {
          select: {
            practitioner: {
              select: { slug: true, displayName: true, imageUrl: true, isHidden: true },
            },
          },
        },
      },
      orderBy: { directoryRemovalRequestedAt: 'asc' },
    })

    return NextResponse.json(
      clinics.map((c) => ({
        ...c,
        practitioners: c.practitionerAssociations.map((a) => a.practitioner),
        practitionerAssociations: undefined,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch directory removal requests:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
