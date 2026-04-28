import { NextResponse } from 'next/server'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { deleteClinic } from '@/lib/data-access/clinics'

const CLINIC_EDIT_SELECT = {
  slug: true,
  name: true,
  city: { select: { slug: true } },
  image: true,
  gmapsUrl: true,
  gmapsAddress: true,
  gmapsPhone: true,
  category: true,
  rating: true,
  reviewCount: true,
  aboutSection: true,
  accreditations: true,
  awards: true,
  affiliations: true,
  website: true,
  email: true,
  facebook: true,
  twitter: true,
  xTwitter: true,
  instagram: true,
  youtube: true,
  linkedin: true,
  isSaveFace: true,
  isDoctor: true,
  isJccp: true,
  jccpUrl: true,
  isCqc: true,
  cqcUrl: true,
  isHiw: true,
  hiwUrl: true,
  isHis: true,
  hisUrl: true,
  isRqia: true,
  rqiaUrl: true,
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: CLINIC_EDIT_SELECT,
    })
    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    const { city, ...rest } = clinic
    return NextResponse.json({ ...rest, citySlug: city?.slug ?? null, rating: rest.rating ? Number(rest.rating) : null })
  } catch (error) {
    console.error('Failed to read clinic:', error)
    return NextResponse.json({ error: 'Failed to read clinic' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    // Strip the slug from body (comes from form but we use URL param)
    const { slug: _slug, ...rest } = body
    const validation = clinicEditSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }
    const clinic = await prisma.clinic.update({
      where: { slug: params.slug },
      data: validation.data as any,
      select: CLINIC_EDIT_SELECT,
    })
    return NextResponse.json({ ...clinic, rating: clinic.rating ? Number(clinic.rating) : null })
  } catch (error) {
    console.error('Failed to update clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await deleteClinic(params.slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 })
  }
}
