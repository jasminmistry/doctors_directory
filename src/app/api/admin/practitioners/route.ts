import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const practitioners = await prisma.practitioner.findMany({
      select: { slug: true, displayName: true, specialty: true, imageUrl: true, title: true },
      orderBy: { displayName: 'asc' },
    })
    return NextResponse.json(practitioners)
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
      },
    })
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Failed to create practitioner:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A practitioner with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create practitioner' }, { status: 500 })
  }
}
