import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { COOKIE_USERNAME } from '@/lib/auth'

export type PortalUser = {
  claimId: number
  entityType: 'clinic' | 'practitioner'
  entitySlug: string
  entityName: string
  clinicId: number | null
  practitionerId: number | null
  claimerName: string
  claimerEmail: string
}

/**
 * Resolves the portal user from the consentz_username cookie.
 * Works in both Server Components and Route Handlers.
 * Returns null if the user has no approved claim (e.g. admin users).
 */
export async function getPortalUser(): Promise<PortalUser | null> {
  const cookieStore = await cookies()
  const username = cookieStore.get(COOKIE_USERNAME)?.value
  if (!username) return null

  const claim = await prisma.claimRequest.findFirst({
    where: { consentzUsername: username, status: 'approved' },
    include: {
      clinic: { select: { name: true, slug: true } },
      practitioner: { select: { displayName: true, slug: true } },
    },
    orderBy: { approvedAt: 'desc' },
  })

  if (!claim) return null

  const entitySlug =
    claim.entityType === 'clinic'
      ? (claim.clinicSlug ?? '')
      : (claim.practitionerSlug ?? '')

  const entityName =
    claim.entityType === 'clinic'
      ? (claim.clinic?.name ?? claim.clinicNameInput ?? claim.clinicSlug ?? '')
      : (claim.practitioner?.displayName ?? claim.practitionerSlug ?? '')

  return {
    claimId: claim.id,
    entityType: claim.entityType as 'clinic' | 'practitioner',
    entitySlug,
    entityName,
    clinicId: claim.clinicId,
    practitionerId: claim.practitionerId,
    claimerName: claim.claimerName,
    claimerEmail: claim.claimerEmail,
  }
}
