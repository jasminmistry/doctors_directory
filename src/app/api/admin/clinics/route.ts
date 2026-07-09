import { NextResponse } from 'next/server'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        slug: true, name: true, image: true, rating: true, reviewCount: true,
        gmapsAddress: true, gmapsPhone: true, email: true, claimed: true, idVerified: true, claimedPlan: true,
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(clinics.map((c) => ({ ...c, rating: c.rating ? Number(c.rating) : null })))
  } catch (error) {
    console.error('Failed to read clinics:', error)
    return NextResponse.json({ error: 'Failed to read clinics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const slug = body.slug?.trim()
    if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    const name = body.name?.trim()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const { slug: _s, name: _n, ...rest } = body
    const validation = clinicEditSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }

    const { isJccp, isCqc, isHiw, isHis, isRqia, ...restData } = validation.data
    const clinic = await prisma.clinic.create({
      data: {
        slug,
        name,
        ...restData,
        isJccp: isJccp ?? false,
        isCqc: isCqc ?? false,
        isHiw: isHiw ?? false,
        isHis: isHis ?? false,
        isRqia: isRqia ?? false,
      } as any,
    })
    await invalidateSearchCache()
    return NextResponse.json({ ...clinic, rating: clinic.rating ? Number(clinic.rating) : null }, { status: 201 })
  } catch (error) {
    console.error('Failed to create clinic:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A clinic with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}
