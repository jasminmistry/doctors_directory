import { NextResponse } from 'next/server'
import { clinicEditSchema } from '@/lib/schemas/clinic.schema'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export const dynamic = 'force-dynamic'

const CLINIC_PORTAL_SELECT = {
  slug: true,
  name: true,
  city: { select: { slug: true } },
  idVerified: true,
  image: true,
  gmapsUrl: true,
  gmapsAddress: true,
  gmapsPhone: true,
  category: true,
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
}

export async function GET() {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'clinic' || !user.clinicId) {
    return NextResponse.json({ error: 'No claimed clinic found' }, { status: 403 })
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: CLINIC_PORTAL_SELECT,
    })
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    const { city, ...rest } = clinic
    return NextResponse.json({ ...rest, citySlug: city?.slug ?? null })
  } catch (error) {
    console.error('[portal] Failed to read clinic:', error)
    return NextResponse.json({ error: 'Failed to read clinic' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'clinic' || !user.clinicId) {
    return NextResponse.json({ error: 'No claimed clinic found' }, { status: 403 })
  }

  try {
    const body = await request.json()
    // Strip fields portal users cannot change
    const { slug: _slug, citySlug: _city, rating: _rating, reviewCount: _rc,
      isSaveFace: _sf, isDoctor: _doc, isJccp: _jccp, jccpUrl: _jccpUrl,
      isCqc: _cqc, cqcUrl: _cqcUrl, isHiw: _hiw, hiwUrl: _hiwUrl,
      isHis: _his, hisUrl: _hisUrl, isRqia: _rqia, rqiaUrl: _rqiaUrl,
      ...editable } = body

    const validation = clinicEditSchema.safeParse(editable)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }

    const clinic = await prisma.clinic.update({
      where: { id: user.clinicId },
      data: validation.data as any,
      select: CLINIC_PORTAL_SELECT,
    })
    const { city, ...rest } = clinic
    return NextResponse.json({ ...rest, citySlug: city?.slug ?? null })
  } catch (error) {
    console.error('[portal] Failed to update clinic:', error)
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
  }
}
