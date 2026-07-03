import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        isHidden: true,
        practitionerAssociations: { select: { practitionerId: true } },
      },
    })

    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

    const nextHidden: boolean = body.hidden ?? !clinic.isHidden
    const practitionerIds = clinic.practitionerAssociations.map((a) => a.practitionerId)

    await prisma.$transaction([
      prisma.clinic.update({
        where: { id: clinic.id },
        data: { isHidden: nextHidden },
      }),
      ...(practitionerIds.length > 0
        ? [
            prisma.practitioner.updateMany({
              where: { id: { in: practitionerIds } },
              data: { isHidden: nextHidden },
            }),
          ]
        : []),
    ])

    return NextResponse.json({ ok: true, hidden: nextHidden, practitionersAffected: practitionerIds.length })
  } catch (error) {
    console.error('Failed to toggle hidden:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
