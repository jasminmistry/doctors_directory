import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { invalidateSearchCache } from '@/lib/search-cache'

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
  clinicAssociations: {
    orderBy: { clinicId: 'asc' as const },
    take: 1,
    include: {
      clinic: {
        select: { id: true, name: true, city: { select: { slug: true, name: true } } },
      },
    },
  },
}

function flattenPractitioner<
  T extends {
    clinicAssociations: { clinic: { id: number; name: string | null; city: { slug: string; name: string } | null } }[]
  }
>(practitioner: T) {
  const primaryClinic = practitioner.clinicAssociations[0]?.clinic ?? null
  const { clinicAssociations: _ca, ...rest } = practitioner
  return {
    ...rest,
    clinicId: primaryClinic?.id ?? null,
    citySlug: primaryClinic?.city?.slug ?? null,
    // Seeds the admin form's clinic combobox label without it having to fetch
    // the full clinics table just to resolve one id back to a display name.
    clinicName: primaryClinic?.name ?? null,
    cityName: primaryClinic?.city?.name ?? null,
  }
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
    return NextResponse.json(flattenPractitioner(practitioner))
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
    const { slug: _slug, clinicId: rawClinicId, ...rest } = body
    const validation = practitionerEditSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }

    const clinicId = Number(rawClinicId)
    if (!clinicId || !Number.isInteger(clinicId) || clinicId <= 0) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    const current = await prisma.practitioner.findUnique({
      where: { slug: params.slug },
      select: { id: true, clinicAssociations: { orderBy: { clinicId: 'asc' }, take: 1, select: { clinicId: true } } },
    })
    if (!current) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true, cityId: true } })
    if (!clinic || !clinic.cityId) {
      return NextResponse.json({ error: 'Selected clinic has no city' }, { status: 400 })
    }

    const oldClinicId = current.clinicAssociations[0]?.clinicId ?? null

    const practitioner = await prisma.practitioner.update({
      where: { slug: params.slug },
      data: {
        ...validation.data,
        clinicAssociations: {
          ...(oldClinicId && oldClinicId !== clinicId ? { deleteMany: { clinicId: oldClinicId } } : {}),
          connectOrCreate: {
            where: { practitionerId_clinicId: { practitionerId: current.id, clinicId } },
            create: { clinicId },
          },
        },
      },
      select: PRACTITIONER_EDIT_SELECT,
    })
    await invalidateSearchCache()
    return NextResponse.json(flattenPractitioner(practitioner))
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
    await invalidateSearchCache()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })
    }
    console.error('Failed to delete practitioner:', error)
    return NextResponse.json({ error: 'Failed to delete practitioner' }, { status: 500 })
  }
}
