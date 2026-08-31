import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') ?? undefined

    const claims = await prisma.claimRequest.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        clinic: {
          select: {
            name: true,
            slug: true,
            gmapsAddress: true,
            category: true,
            city: { select: { slug: true } },
          },
        },
        practitioner: {
          select: {
            displayName: true,
            slug: true,
            specialty: true,
            clinicAssociations: {
              orderBy: { clinicId: 'asc' },
              take: 1,
              select: { clinic: { select: { city: { select: { slug: true } } } } },
            },
          },
        },
      },
    })

    // Public directory URL for the claimed profile — lets admins open the live
    // listing while reviewing. Null for new registrations (no profile yet) or
    // when the city slug can't be resolved.
    const withProfileUrl = claims.map((claim) => {
      let profileUrl: string | null = null
      if (claim.clinic?.slug && claim.clinic.city?.slug) {
        profileUrl = `/directory/clinics/${claim.clinic.city.slug}/clinic/${claim.clinic.slug}`
      } else if (claim.practitioner?.slug) {
        const citySlug = claim.practitioner.clinicAssociations[0]?.clinic?.city?.slug
        if (citySlug) {
          profileUrl = `/directory/practitioners/${citySlug}/profile/${claim.practitioner.slug}`
        }
      }
      return { ...claim, profileUrl }
    })

    return NextResponse.json(withProfileUrl)
  } catch (error) {
    console.error('Admin claims list error:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}
