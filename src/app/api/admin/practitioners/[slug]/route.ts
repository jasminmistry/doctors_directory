import { NextResponse } from 'next/server'
import { validatePractitioner } from '@/lib/admin/validators'
import { prisma } from '@/lib/db'
import { getPractitionerBySlug, convertDbPractitionerToOldType } from '@/lib/data-access/practitioners'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const practitioner = await getPractitionerBySlug(params.slug)

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
    const data = await request.json()
    const validation = validatePractitioner(data)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid practitioner data', details: validation.error.errors }, { status: 400 })
    }

    const d = validation.data as any

    const record = await prisma.practitioner.update({
      where: { slug: params.slug },
      data: {
        displayName: d.practitioner_name ?? undefined,
        title: d.practitioner_title ?? undefined,
        specialty: d.practitioner_specialty ?? undefined,
        imageUrl: d.practitioner_image_link ?? undefined,
        qualifications: d.practitioner_qualifications ?? undefined,
        awards: d.practitioner_awards ?? undefined,
        roles: d.practitioner_roles ?? undefined,
        media: d.practitioner_media ?? undefined,
        experience: d.practitioner_experience ?? undefined,
      },
      include: {
        ranking: true,
        treatments: { select: { treatment: { select: { name: true } } } },
        clinicAssociations: {
          orderBy: { clinicId: 'asc' },
          include: { clinic: { select: { id: true, slug: true, image: true, rating: true, reviewCount: true, gmapsAddress: true, gmapsUrl: true, category: true, isSaveFace: true, isDoctor: true, isJccp: true, isCqc: true, isHiw: true, isHis: true, isRqia: true, paymentMethods: true, city: { select: { name: true } }, treatments: { select: { treatment: { select: { name: true } } } }, hours: { select: { dayOfWeek: true, hours: true } } } } },
        },
      },
    })

    return NextResponse.json(convertDbPractitionerToOldType(record))
  } catch (error) {
    console.error('Failed to update practitioner:', error)
    return NextResponse.json({ error: 'Failed to update practitioner' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
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
