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
  city: { select: { slug: true, name: true } },
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
  placeId: true,
  treatments: { select: { treatmentId: true } },
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
    const { city, treatments, id: _id, ...rest } = clinic
    const consentzUsername = await getLinkedConsentzUsername(clinic.coreClinicId)
    return NextResponse.json({ ...rest, treatmentIds: treatments.map((t) => t.treatmentId), citySlug: city?.slug ?? null, cityName: city?.name ?? null, rating: rest.rating ? Number(rest.rating) : null, consentzUsername })
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
    // Strip the slug, citySlug and consentzUsername from body — none is a Clinic
    // column directly (slug comes from the URL param, citySlug resolves to cityId
    // below, consentzUsername is synced onto ClaimRequest separately below)
    const { slug: _slug, consentzUsername: rawConsentzUsername, citySlug: rawCitySlug, ...rest } = body
    const validation = clinicEditSchema.safeParse(rest)
    const fieldErrors: Record<string, string> = {}
    if (!validation.success) {
      for (const issue of validation.error.errors) {
        const key = issue.path[0]
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message
        }
      }
    }

    const citySlug = typeof rawCitySlug === 'string' ? rawCitySlug.trim() : ''
    if (!citySlug) fieldErrors.citySlug = 'City is required'
    const cityRecord = citySlug ? await prisma.city.findUnique({ where: { slug: citySlug }, select: { id: true } }) : null
    if (citySlug && !cityRecord) fieldErrors.citySlug = 'Unknown city'

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

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: 'Please fix the highlighted fields', fieldErrors },
        { status: 400 }
      )
    }

    const { treatmentIds, ...clinicFields } = validation.data as any

    await prisma.$transaction(async (tx) => {
      const updated = await tx.clinic.update({
        where: { slug: params.slug },
        data: { ...clinicFields, cityId: cityRecord!.id },
        select: { id: true },
      })
      if (treatmentIds !== undefined) {
        // notIn: [] matches every existing row, so an empty list clears all treatments
        await tx.clinicTreatment.deleteMany({ where: { clinicId: updated.id, treatmentId: { notIn: treatmentIds } } })
        if (treatmentIds.length > 0) {
          await tx.clinicTreatment.createMany({
            data: treatmentIds.map((treatmentId: number) => ({ clinicId: updated.id, treatmentId })),
            skipDuplicates: true,
          })
        }
      }
    })

    const clinic = await prisma.clinic.findUniqueOrThrow({
      where: { slug: params.slug },
      select: CLINIC_EDIT_SELECT,
    })

    if (clinic.coreClinicId) {
      await syncConsentzLinkClaim(clinic, clinic.coreClinicId, consentzUsername)
        .catch((err) => console.error('[admin/clinics] Failed to sync Consentz link claim:', err))
    }

    await invalidateSearchCache()
    const { id: _id, city, treatments, ...clinicRest } = clinic
    return NextResponse.json({ ...clinicRest, treatmentIds: treatments.map((t) => t.treatmentId), citySlug: city?.slug ?? null, cityName: city?.name ?? null, rating: clinic.rating ? Number(clinic.rating) : null, consentzUsername })
  } catch (error) {
    console.error('Failed to update clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    if ((error as any).code === 'P2000') {
      return NextResponse.json({ error: 'One of the fields is too long' }, { status: 400 })
    }
    if ((error as any).code === 'P2003') {
      return NextResponse.json({ error: 'One or more selected treatments do not exist' }, { status: 400 })
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
