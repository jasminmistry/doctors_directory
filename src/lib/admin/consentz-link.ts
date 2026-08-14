import { z } from 'zod'
import { prisma } from '@/lib/db'

export const consentzUsernameSchema = z.string().trim().max(100).nullable().optional()

/**
 * Reads the Consentz username stored on whichever linked ClaimRequest covers this Core
 * clinic — the source of truth consentz-sso/route.ts checks on SSO login.
 */
export async function getLinkedConsentzUsername(coreClinicId: number | null): Promise<string | null> {
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
export async function syncConsentzLinkClaim(
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
