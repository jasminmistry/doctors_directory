import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const featured = await prisma.featuredProfile.findMany({
      orderBy: { position: 'asc' },
    })

    if (featured.length === 0) return NextResponse.json([])

    const slugs = featured.map((f) => f.clinicSlug)
    const clinics = await prisma.clinic.findMany({
      where: { slug: { in: slugs } },
      select: {
        slug: true,
        name: true,
        image: true,
        category: true,
        rating: true,
        reviewCount: true,
        gmapsAddress: true,
        city: { select: { name: true } },
        treatments: { include: { treatment: { select: { name: true } } } },
      },
    })

    const clinicMap = new Map(clinics.map((c) => [c.slug, c]))

    const result = featured.map((f) => {
      const clinic = clinicMap.get(f.clinicSlug)
      return {
        id: f.id,
        clinicSlug: f.clinicSlug,
        position: f.position,
        name: clinic?.name ?? f.clinicSlug,
        image: clinic?.image ?? null,
        category: clinic?.category ?? null,
        rating: clinic?.rating ? Number(clinic.rating) : null,
        reviewCount: clinic?.reviewCount ?? 0,
        gmapsAddress: clinic?.gmapsAddress ?? null,
        City: clinic?.city?.name ?? null,
        Treatments: clinic?.treatments.map((ct) => ct.treatment.name) ?? [],
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch featured profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch featured profiles' }, { status: 500 })
  }
}

// Body: { slugs: string[] } — full replacement in given order
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const slugs: string[] = Array.isArray(body.slugs) ? body.slugs : []

    await prisma.$transaction(async (tx) => {
      await tx.featuredProfile.deleteMany()
      if (slugs.length > 0) {
        await tx.featuredProfile.createMany({
          data: slugs.map((slug, index) => ({
            clinicSlug: slug,
            position: index + 1,
          })),
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to update featured profiles:', error)
    return NextResponse.json({ error: 'Failed to update featured profiles' }, { status: 500 })
  }
}
