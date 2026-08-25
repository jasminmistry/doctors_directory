import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [clinics, practitioners] = await Promise.all([
      prisma.clinic.findMany({
        where: { scheduledDeletionAt: { not: null } },
        select: { slug: true, name: true, image: true, email: true, scheduledDeletionAt: true },
        orderBy: { scheduledDeletionAt: 'asc' },
      }),
      prisma.practitioner.findMany({
        where: { scheduledDeletionAt: { not: null } },
        select: { slug: true, displayName: true, imageUrl: true, scheduledDeletionAt: true },
        orderBy: { scheduledDeletionAt: 'asc' },
      }),
    ])

    return NextResponse.json([
      ...clinics.map((c) => ({
        entityType: 'clinic' as const,
        slug: c.slug,
        name: c.name,
        image: c.image,
        email: c.email,
        scheduledDeletionAt: c.scheduledDeletionAt,
      })),
      ...practitioners.map((p) => ({
        entityType: 'practitioner' as const,
        slug: p.slug,
        name: p.displayName,
        image: p.imageUrl,
        email: null,
        scheduledDeletionAt: p.scheduledDeletionAt,
      })),
    ])
  } catch (error) {
    console.error('Failed to fetch account deletion requests:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
