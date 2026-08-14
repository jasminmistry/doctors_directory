import { NextResponse } from 'next/server'
import { z } from 'zod'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { deleteClinic } from '@/lib/data-access/clinics'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

const consentzUsernameSchema = z.string().trim().max(100).nullable().optional()

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

/**
 * Reads the Consentz username stored on whichever linked ClaimRequest covers this Core
 * clinic — the source of truth consentz-sso/route.ts checks on SSO login.
 */
async function getLinkedConsentzUsername(coreClinicId: number | null): Promise<string | null> {
  if (!coreClinicId) return null
  const claim = await prisma.claimRequest.findFirst({
    where: { consentzClinicId: coreClinicId, status: { in: ['approved', 'pending_approval'] } },
    orderBy: { createdAt: 'desc' },
    select: { consentzUsername: true },
  })
  return claim?.consentzUsername ?? null
}

/**
 * Clinics linked purely by an admin typing in a Core Clinic ID (rather than going through
 * the self-service claim/consentz-link flow) have no ClaimRequest row — which breaks both
 * portal SSO login (consentz-sso/route.ts looks up ClaimRequest by consentzClinicId) and
 * portal session resolution (getPortalUser() in src/lib/portal.ts looks up ClaimRequest by
 * consentzUsername). Creating/updating one here on manual link keeps the admin path
 * producing the same shape the self-service path already relies on everywhere downstream.
 */
async function syncConsentzLinkClaim(
  clinic: { id: number; slug: string; name: string | null; email: string | null },
  consentzClinicId: number,
  consentzUsername: string | null,
) {
  const existing = await prisma.claimRequest.findFirst({
    where: {
      status: { in: ['approved', 'pending_approval'] },
      OR: [{ consentzClinicId }, { entityType: 'clinic', clinicId: clinic.id }],
    },
    orderBy: { createdAt: 'desc' },
  })

  if (existing) {
    await prisma.claimRequest.update({
      where: { id: existing.id },
      data: { consentzClinicId, consentzUsername, clinicId: clinic.id, clinicSlug: clinic.slug },
    })
    return
  }

  if (!consentzUsername) return // nothing to verify against yet — wait for an admin to fill it in

  await prisma.claimRequest.create({
    data: {
      entityType: 'clinic',
      clinicId: clinic.id,
      clinicSlug: clinic.slug,
      status: 'approved',
      approvedAt: new Date(),
      consentzClinicId,
      consentzUsername,
      claimerName: clinic.name ?? clinic.slug,
      claimerEmail: clinic.email ?? `${clinic.slug}@directory-admin.internal`,
    },
  })
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
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
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
