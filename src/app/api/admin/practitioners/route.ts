import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const practitioners = await prisma.practitioner.findMany({
      select: {
        slug: true, displayName: true, specialty: true, imageUrl: true, claimed: true, verified: true, claimedPlan: true,
        clinicAssociations: {
          orderBy: { clinicId: 'asc' },
          take: 1,
          select: { clinic: { select: { city: { select: { name: true } } } } },
        },
      },
      orderBy: { displayName: 'asc' },
    })
    return NextResponse.json(
      practitioners.map(({ clinicAssociations, ...p }) => ({
        ...p,
        cityName: clinicAssociations[0]?.clinic?.city?.name ?? null,
      }))
    )
  } catch (error) {
    console.error('Failed to read practitioners:', error)
    return NextResponse.json({ error: 'Failed to read practitioners' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const slug = body.slug?.trim()
    if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    const displayName = body.displayName?.trim()
    if (!displayName) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    const clinicId = Number(body.clinicId)
    if (!clinicId || !Number.isInteger(clinicId) || clinicId <= 0) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true, cityId: true } })
    if (!clinic || !clinic.cityId) {
      return NextResponse.json({ error: 'Selected clinic has no city' }, { status: 400 })
    }

    const record = await prisma.practitioner.create({
      data: {
        slug,
        displayName,
        title: body.title ?? null,
        specialty: body.specialty ?? null,
        imageUrl: body.imageUrl ?? null,
        qualifications: body.qualifications ?? undefined,
        awards: body.awards ?? undefined,
        roles: body.roles ?? undefined,
        media: body.media ?? undefined,
        experience: body.experience ?? undefined,
        clinicAssociations: { create: { clinicId } },
      },
    })
    await invalidateSearchCache()
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Failed to create practitioner:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A practitioner with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create practitioner' }, { status: 500 })
  }
}
