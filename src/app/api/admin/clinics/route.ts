import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        slug: true, name: true, image: true, category: true, rating: true, reviewCount: true,
        gmapsAddress: true,
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

    const { slug: _s, ...rest } = body
    const clinic = await prisma.clinic.create({
      data: { slug, name, ...rest } as any,
    })
    return NextResponse.json({ ...clinic, rating: clinic.rating ? Number(clinic.rating) : null }, { status: 201 })
  } catch (error) {
    console.error('Failed to create clinic:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A clinic with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}
