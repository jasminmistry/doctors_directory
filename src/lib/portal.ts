import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { COOKIE_USERNAME, COOKIE_ACTIVE_CLINIC } from '@/lib/auth'
import { getClinicDisplayName } from '@/lib/clinic-display'
import type { PortalClinicSummary } from '@/lib/types'

export type PortalUser = {
  claimId: number
  entityType: 'clinic' | 'practitioner'
  entitySlug: string
  entityName: string
  clinicId: number | null
  practitionerId: number | null
  claimerName: string
  claimerEmail: string
  /** Present only when this user has more than one approved clinic claim. */
  clinics?: PortalClinicSummary[]
}

/**
 * Resolves the portal user from the consentz_username cookie.
 * Works in both Server Components and Route Handlers.
 * Returns null if the user has no approved claim (e.g. admin users).
 *
 * A claimer can have more than one approved clinic claim (e.g. running
 * several locations). The active one is picked via the
 * consentz_active_clinic_id cookie, falling back to the most recently
 * approved claim if unset or if it points at a clinic the user no longer holds.
 */
export async function getPortalUser(): Promise<PortalUser | null> {
  const cookieStore = await cookies()
  const username = cookieStore.get(COOKIE_USERNAME)?.value
  if (!username) return null

  const claims = await prisma.claimRequest.findMany({
    where: { consentzUsername: username, status: 'approved' },
    include: {
      clinic: { select: { slug: true, gmapsUrl: true, image: true } },
      practitioner: { select: { displayName: true, slug: true } },
    },
    orderBy: { approvedAt: 'desc' },
  })

  if (claims.length === 0) return null

  const activeClinicIdCookie = cookieStore.get(COOKIE_ACTIVE_CLINIC)?.value
  const activeClinicId = activeClinicIdCookie ? Number(activeClinicIdCookie) : null
  const claim =
    (activeClinicId
      ? claims.find((c) => c.entityType === 'clinic' && c.clinicId === activeClinicId)
      : undefined) ?? claims[0]

  const entitySlug =
    claim.entityType === 'clinic'
      ? (claim.clinicSlug ?? '')
      : (claim.practitionerSlug ?? '')

  const entityName =
    claim.entityType === 'clinic'
      ? (claim.clinic
          ? getClinicDisplayName({ slug: claim.clinic.slug, url: claim.clinic.gmapsUrl ?? undefined })
          : (claim.clinicNameInput ?? claim.clinicSlug ?? ''))
      : (claim.practitioner?.displayName ?? claim.practitionerSlug ?? '')

  const clinicClaims = claims.filter(
    (c): c is typeof c & { clinicId: number } => c.entityType === 'clinic' && c.clinicId !== null,
  )
  const clinics: PortalClinicSummary[] | undefined =
    clinicClaims.length > 1
      ? clinicClaims.map((c) => ({
          claimId: c.id,
          clinicId: c.clinicId,
          slug: c.clinicSlug ?? c.clinic?.slug ?? '',
          name: c.clinic
            ? getClinicDisplayName({ slug: c.clinic.slug, url: c.clinic.gmapsUrl ?? undefined })
            : (c.clinicNameInput ?? c.clinicSlug ?? ''),
          image: c.clinic?.image ?? null,
        }))
      : undefined

  return {
    claimId: claim.id,
    entityType: claim.entityType as 'clinic' | 'practitioner',
    entitySlug,
    entityName,
    clinicId: claim.clinicId,
    practitionerId: claim.practitionerId,
    claimerName: claim.claimerName,
    claimerEmail: claim.claimerEmail,
    clinics,
  }
}
