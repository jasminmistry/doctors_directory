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

    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''

    const fieldErrors: Record<string, string> = {}
    if (!slug) fieldErrors.slug = 'Slug is required'
    else if (!/^[a-z0-9-]+$/.test(slug)) fieldErrors.slug = 'Slug must be kebab-case'
    if (!displayName) fieldErrors.displayName = 'Display name is required'

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: 'Please fix the highlighted fields', fieldErrors },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'A practitioner with this slug already exists', fieldErrors: { slug: 'This slug is already taken' } },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create practitioner' }, { status: 500 })
  }
}
