import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const practitionerEditSchema = z.object({
  displayName: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  qualifications: z.any().optional().nullable(),
  awards: z.any().optional().nullable(),
  roles: z.any().optional().nullable(),
  media: z.any().optional().nullable(),
  experience: z.any().optional().nullable(),
})

const PRACTITIONER_EDIT_SELECT = {
  slug: true,
  displayName: true,
  title: true,
  specialty: true,
  imageUrl: true,
  qualifications: true,
  awards: true,
  roles: true,
  media: true,
  experience: true,
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const practitioner = await prisma.practitioner.findUnique({
      where: { slug: params.slug },
      select: PRACTITIONER_EDIT_SELECT,
    })
    if (!practitioner) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })
    }
    return NextResponse.json(practitioner)
  } catch (error) {
    console.error('Failed to read practitioner:', error)
    return NextResponse.json({ error: 'Failed to read practitioner' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { slug: _slug, ...rest } = body
    const validation = practitionerEditSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }
    const practitioner = await prisma.practitioner.update({
      where: { slug: params.slug },
      data: validation.data,
      select: PRACTITIONER_EDIT_SELECT,
    })
    return NextResponse.json(practitioner)
  } catch (error) {
    console.error('Failed to update practitioner:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update practitioner' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.practitioner.delete({ where: { slug: params.slug } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })
    }
    console.error('Failed to delete practitioner:', error)
    return NextResponse.json({ error: 'Failed to delete practitioner' }, { status: 500 })
  }
}
