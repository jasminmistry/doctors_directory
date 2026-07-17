import { NextResponse } from 'next/server'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

function omitNullish(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null && value !== undefined)
  )
}

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        id: true, slug: true, name: true, image: true, rating: true, reviewCount: true,
        gmapsAddress: true, gmapsPhone: true, email: true, claimed: true, idVerified: true, claimedPlan: true,
        city: { select: { slug: true, name: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(clinics.map(({ city, ...c }) => ({
      ...c,
      rating: c.rating ? Number(c.rating) : null,
      citySlug: city?.slug ?? null,
      cityName: city?.name ?? null,
    })))
  } catch (error) {
    console.error('Failed to read clinics:', error)
    return NextResponse.json({ error: 'Failed to read clinics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    const fieldErrors: Record<string, string> = {}
    if (!slug) fieldErrors.slug = 'Slug is required'
    else if (!/^[a-z0-9-]+$/.test(slug)) fieldErrors.slug = 'Slug must be kebab-case'
    if (!name) fieldErrors.name = 'Clinic name is required'

    const { slug: _s, name: _n, citySlug: _c, ...rest } = body
    const validation = clinicEditSchema.safeParse(rest)
    if (!validation.success) {
      for (const issue of validation.error.errors) {
        const key = issue.path[0]
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: 'Please fix the highlighted fields', fieldErrors },
        { status: 400 }
      )
    }

    const clinic = await prisma.clinic.create({
      data: {
        slug,
        name,
        ...omitNullish((validation.success ? validation.data : {}) as Record<string, unknown>),
      } as any,
    })
    await invalidateSearchCache()
    return NextResponse.json({ ...clinic, rating: clinic.rating ? Number(clinic.rating) : null }, { status: 201 })
  } catch (error) {
    console.error('Failed to create clinic:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A clinic with this slug already exists', fieldErrors: { slug: 'This slug is already taken' } }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}
