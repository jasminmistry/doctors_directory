import { NextResponse } from 'next/server'
import { validatePractitioner } from '@/lib/admin/validators'
import { prisma } from '@/lib/db'
import { getAllPractitionersForSearch, convertDbPractitionerToOldType } from '@/lib/data-access/practitioners'

export async function GET() {
  try {
    const practitioners = await getAllPractitionersForSearch()
    return NextResponse.json(practitioners)
  } catch (error) {
    console.error('Failed to read practitioners:', error)
    return NextResponse.json({ error: 'Failed to read practitioners' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validation = validatePractitioner(data)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid practitioner data', details: validation.error.errors }, { status: 400 })
    }

    const d = validation.data as any
    const slug = d.practitioner_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'unknown'

    const record = await prisma.practitioner.create({
      data: {
        slug,
        displayName: d.practitioner_name ?? null,
        title: d.practitioner_title ?? null,
        specialty: d.practitioner_specialty ?? null,
        imageUrl: d.practitioner_image_link ?? null,
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
          include: { clinic: { select: { id: true, slug: true, image: true, rating: true, reviewCount: true, gmapsAddress: true, gmapsUrl: true, category: true, isSaveFace: true, isDoctor: true, isJccp: true, isCqc: true, isHiw: true, isHis: true, isRqia: true, paymentMethods: true, city: { select: { name: true } }, treatments: { select: { treatment: { select: { name: true } } } } } } },
        },
      },
    })

    return NextResponse.json(convertDbPractitionerToOldType(record), { status: 201 })
  } catch (error) {
    console.error('Failed to create practitioner:', error)
    return NextResponse.json({ error: 'Failed to create practitioner' }, { status: 500 })
  }
}
