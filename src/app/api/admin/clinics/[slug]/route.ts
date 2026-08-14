import { NextResponse } from 'next/server'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { deleteClinic } from '@/lib/data-access/clinics'
import { invalidateSearchCache } from '@/lib/search-cache'
import { consentzUsernameSchema, getLinkedConsentzUsername, syncConsentzLinkClaim } from '@/lib/admin/consentz-link'

export const dynamic = 'force-dynamic'

const CLINIC_EDIT_SELECT = {
  id: true,
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
  coverImage: true,
  cqcStatus: true,
  avgReplyTime: true,
  coreClinicId: true,
  coreUnlinkRequestedAt: true,
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
    const { city, id: _id, ...rest } = clinic
    const consentzUsername = await getLinkedConsentzUsername(clinic.coreClinicId)
    return NextResponse.json({ ...rest, citySlug: city?.slug ?? null, rating: rest.rating ? Number(rest.rating) : null, consentzUsername })
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
    // Strip the slug and consentzUsername from body — neither is a Clinic column
    // (comes from form but we use URL param / sync it onto ClaimRequest separately below)
    const { slug: _slug, consentzUsername: rawConsentzUsername, ...rest } = body
    const validation = clinicEditSchema.safeParse(rest)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of validation.error.errors) {
        const key = issue.path[0]
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message
        }
      }
      return NextResponse.json(
        { error: 'Please fix the highlighted fields', fieldErrors },
        { status: 400 }
      )
    }
    const usernameValidation = consentzUsernameSchema.safeParse(rawConsentzUsername)
    if (!usernameValidation.success) {
      return NextResponse.json({ error: 'Invalid Consentz username' }, { status: 400 })
    }
    const consentzUsername = usernameValidation.data?.trim() || null

    const clinic = await prisma.clinic.update({
      where: { slug: params.slug },
      data: validation.data as any,
      select: CLINIC_EDIT_SELECT,
    })

    if (clinic.coreClinicId) {
      await syncConsentzLinkClaim(clinic, clinic.coreClinicId, consentzUsername)
        .catch((err) => console.error('[admin/clinics] Failed to sync Consentz link claim:', err))
    }

    await invalidateSearchCache()
    const { id: _id, ...clinicRest } = clinic
    return NextResponse.json({ ...clinicRest, rating: clinic.rating ? Number(clinic.rating) : null, consentzUsername })
  } catch (error) {
    console.error('Failed to update clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    if ((error as any).code === 'P2000') {
      return NextResponse.json({ error: 'One of the fields is too long' }, { status: 400 })
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
    await invalidateSearchCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 })
  }
}
