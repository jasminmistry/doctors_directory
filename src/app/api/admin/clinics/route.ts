import { NextResponse } from 'next/server'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { invalidateSearchCache } from '@/lib/search-cache'
import { consentzUsernameSchema, syncConsentzLinkClaim } from '@/lib/admin/consentz-link'

export const dynamic = 'force-dynamic'

function omitNullish(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null && value !== undefined)
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()

    const clinics = await prisma.clinic.findMany({
      where: search
        ? { OR: [{ name: { contains: search } }, { city: { name: { contains: search } } }] }
        : undefined,
      select: {
        id: true, slug: true, name: true, image: true, rating: true, reviewCount: true,
        gmapsAddress: true, gmapsPhone: true, email: true, claimed: true, idVerified: true, claimedPlan: true,
        coreClinicId: true,
        city: { select: { slug: true, name: true } },
      },
      orderBy: { name: 'asc' },
      // Unbounded list is only safe because it's used by the full clinics admin table;
      // a `search` query is the combobox use case and must stay small.
      ...(search ? { take: 20 } : {}),
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
    const citySlug = typeof body.citySlug === 'string' ? body.citySlug.trim() : ''

    const fieldErrors: Record<string, string> = {}
    if (!slug) fieldErrors.slug = 'Slug is required'
    else if (!/^[a-z0-9-]+$/.test(slug)) fieldErrors.slug = 'Slug must be kebab-case'
    if (!name) fieldErrors.name = 'Clinic name is required'
    if (!citySlug) fieldErrors.citySlug = 'City is required'

    const { slug: _s, name: _n, citySlug: _c, consentzUsername: rawConsentzUsername, ...rest } = body
    const validation = clinicEditSchema.safeParse(rest)
    if (!validation.success) {
      for (const issue of validation.error.errors) {
        const key = issue.path[0]
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message
        }
      }
    }

    const usernameValidation = consentzUsernameSchema.safeParse(rawConsentzUsername)
    if (!usernameValidation.success) fieldErrors.consentzUsername = 'Invalid Consentz username'
    const consentzUsername = usernameValidation.success ? (usernameValidation.data?.trim() || null) : null
    // consentzUsername is only ever persisted (onto a linked ClaimRequest, see
    // syncConsentzLinkClaim below) when a Core Clinic ID is present — without it the
    // sync silently no-ops, so a typed username would vanish with no feedback. Reject
    // the save instead so the admin knows to fill in Core Clinic ID first.
    const coreClinicId = validation.success ? (validation.data.coreClinicId ?? null) : null
    if (consentzUsername && !coreClinicId) {
      fieldErrors.consentzUsername = 'Set a Core Clinic ID first — the username is linked to it and won\'t be saved without one'
    }

    const city = citySlug ? await prisma.city.findUnique({ where: { slug: citySlug }, select: { id: true } }) : null
    if (citySlug && !city) fieldErrors.citySlug = 'Unknown city'

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
        cityId: city!.id,
        ...omitNullish((validation.success ? validation.data : {}) as Record<string, unknown>),
      } as any,
    })

    if (clinic.coreClinicId) {
      await syncConsentzLinkClaim(clinic, clinic.coreClinicId, consentzUsername)
        .catch((err) => console.error('[admin/clinics] Failed to sync Consentz link claim:', err))
    }

    await invalidateSearchCache()
    return NextResponse.json({ ...clinic, rating: clinic.rating ? Number(clinic.rating) : null, consentzUsername }, { status: 201 })
  } catch (error) {
    console.error('Failed to create clinic:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A clinic with this slug already exists', fieldErrors: { slug: 'This slug is already taken' } }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}
