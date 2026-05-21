import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export const dynamic = 'force-dynamic'

const practitionerPortalSchema = z.object({
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

const PRACTITIONER_PORTAL_SELECT = {
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
  idVerified: true,
  claimedPlan: true,
  claimedAt: true,
  clinicAssociations: {
    take: 1,
    include: {
      clinic: {
        select: { city: { select: { slug: true } } },
      },
    },
  },
}

export async function GET() {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'practitioner' || !user.practitionerId) {
    return NextResponse.json({ error: 'No claimed practitioner found' }, { status: 403 })
  }

  try {
    const [practitioner, claim] = await Promise.all([
      prisma.practitioner.findUnique({
        where: { id: user.practitionerId },
        select: PRACTITIONER_PORTAL_SELECT,
      }),
      prisma.claimRequest.findFirst({
        where: { practitionerId: user.practitionerId, status: 'approved' },
        select: { selectedPlan: true, stripeSubscriptionId: true, stripeCustomerId: true, approvedAt: true },
        orderBy: { approvedAt: 'desc' },
      }),
    ])
    if (!practitioner) return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })

    const citySlug = practitioner.clinicAssociations[0]?.clinic?.city?.slug ?? null
    const { clinicAssociations: _ca, ...rest } = practitioner

    return NextResponse.json({
      ...rest,
      citySlug,
      subscription: {
        plan: claim?.selectedPlan ?? practitioner.claimedPlan ?? null,
        stripeSubscriptionId: claim?.stripeSubscriptionId ?? null,
        approvedAt: claim?.approvedAt ?? practitioner.claimedAt ?? null,
      },
    })
  } catch (error) {
    console.error('[portal] Failed to read practitioner:', error)
    return NextResponse.json({ error: 'Failed to read practitioner' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'practitioner' || !user.practitionerId) {
    return NextResponse.json({ error: 'No claimed practitioner found' }, { status: 403 })
  }

  const practitionerCheck = await prisma.practitioner.findUnique({ where: { id: user.practitionerId }, select: { idVerified: true } })
  if (!practitionerCheck?.idVerified) {
    return NextResponse.json({ error: 'Profile editing requires ID verification' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { slug: _slug, ...rest } = body
    const validation = practitionerPortalSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }

    const practitioner = await prisma.practitioner.update({
      where: { id: user.practitionerId },
      data: validation.data,
      select: PRACTITIONER_PORTAL_SELECT,
    })
    return NextResponse.json(practitioner)
  } catch (error) {
    console.error('[portal] Failed to update practitioner:', error)
    return NextResponse.json({ error: 'Failed to update practitioner' }, { status: 500 })
  }
}
