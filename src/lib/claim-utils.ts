import crypto from 'crypto'
import { prisma } from './db'
import type { ClaimStatus } from '@prisma/client'
import { PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from './pricing'
export { isGenericEmailDomain } from './email-domains'

export type ClaimState = 'unclaimed' | 'pending' | 'claimed'

/**
 * A claim counts as "active" (blocking) while it's genuinely in flight:
 * - otp_verified / pending_approval: no expiry column, stay active until resolved
 * - pending_otp / awaiting_consentz_link: only active while their own OTP/link
 *   token hasn't expired yet — otherwise an abandoned request (very common: user
 *   requests a code and never enters it) would lock the entity out forever, since
 *   nothing ever flips these rows to 'rejected' automatically.
 */
function activeClaimWhere(idWhere: Record<string, unknown>) {
  const now = new Date()
  return {
    ...idWhere,
    OR: [
      { status: { in: ['otp_verified', 'pending_approval'] as ClaimStatus[] } },
      { status: 'pending_otp' as ClaimStatus, otpExpiresAt: { gt: now } },
      { status: 'awaiting_consentz_link' as ClaimStatus, linkTokenExpiresAt: { gt: now } },
    ],
  }
}

/**
 * Resolves whether a clinic/practitioner is unclaimed, has an in-flight claim
 * request, or is already claimed. Rejected claims (and lapsed/expired ones)
 * don't count — the entity is treated as unclaimed again.
 */
export async function getClaimState(entity: {
  claimed: boolean
  entityType: 'clinic' | 'practitioner'
  slug: string
}): Promise<ClaimState> {
  if (entity.claimed) return 'claimed'

  const idWhere =
    entity.entityType === 'clinic'
      ? { clinicSlug: entity.slug }
      : { practitionerSlug: entity.slug }

  const activeClaim = await prisma.claimRequest.findFirst({
    where: activeClaimWhere(idWhere),
    select: { id: true },
  })

  return activeClaim ? 'pending' : 'unclaimed'
}

/**
 * True if `claimId` is itself the active claim causing an entity's state to be
 * 'pending' — lets a claimant resume their own in-progress wizard (e.g. backing
 * out of Stripe Checkout) instead of being shown the "already under review" wall.
 */
export async function isOwnActiveClaim(params: {
  entityType: 'clinic' | 'practitioner'
  entityId: number
  claimId: number
}): Promise<boolean> {
  const idWhere = params.entityType === 'clinic' ? { clinicId: params.entityId } : { practitionerId: params.entityId }
  const claim = await prisma.claimRequest.findFirst({
    where: { ...activeClaimWhere(idWhere), id: params.claimId },
    select: { id: true },
  })
  return !!claim
}

/**
 * True if someone OTHER than `claimerEmail` currently has an active claim on this
 * entity. Used to gate *new* claim submissions (`/api/claim/initiate`) without
 * blocking the claimant's own retries — e.g. "Resend code" re-submits the details
 * form under the same email, which must be allowed through to the existing
 * cancel-stale-and-recreate logic rather than rejected as a competing claim.
 */
export async function hasCompetingActiveClaim(params: {
  entityType: 'clinic' | 'practitioner'
  entityId: number
  claimerEmail: string
}): Promise<boolean> {
  const idWhere = params.entityType === 'clinic' ? { clinicId: params.entityId } : { practitionerId: params.entityId }
  const activeClaims = await prisma.claimRequest.findMany({
    where: activeClaimWhere(idWhere),
    select: { claimerEmail: true },
  })
  const email = params.claimerEmail.trim().toLowerCase()
  return activeClaims.some((c) => c.claimerEmail.trim().toLowerCase() !== email)
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999))
}

export function otpExpiresAt(): Date {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 10)
  return d
}

export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function isDomainMatch(email: string, website: string): boolean {
  try {
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!emailDomain) return false
    const site = website.startsWith('http') ? website : `https://${website}`
    const siteDomain = new URL(site).hostname.replace(/^www\./, '')
    return emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`)
  } catch {
    return false
  }
}

export const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pay_per_lead: 'Pay-Per-Lead',
  subscription: 'Subscription',
}

export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pay_per_lead: PPL_LEAD_PRICE,
  subscription: SUBSCRIPTION_MONTHLY_PRICE,
}
