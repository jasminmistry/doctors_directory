import crypto from 'crypto'
import Stripe from 'stripe'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { invalidateSearchCache } from '@/lib/search-cache'

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
}

export const DELETION_GRACE_PERIOD_DAYS = 7

const SECRET = process.env.UNSUBSCRIBE_SECRET ?? 'unsubscribe-dev-secret-change-in-prod'

export type DeletionEntityType = 'clinic' | 'practitioner'

interface DeletionCancelClaims {
  entityType: DeletionEntityType
  entityId: number
}

export function signDeletionCancelToken(entityType: DeletionEntityType, entityId: number): string {
  const data = Buffer.from(JSON.stringify({ entityType, entityId } satisfies DeletionCancelClaims)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyDeletionCancelToken(token: string): DeletionCancelClaims | null {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  try {
    if (sig.length !== expected.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const claims = JSON.parse(Buffer.from(data, 'base64url').toString()) as DeletionCancelClaims
    if (claims.entityType !== 'clinic' && claims.entityType !== 'practitioner') return null
    return claims
  } catch {
    return null
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

/** Reverts a deleted/deleting clinic's claim fields back to a clean unclaimed state. */
const UNCLAIM_CLINIC_DATA = {
  claimed: false,
  claimedAt: null,
  claimedPlan: null,
  verified: false,
  domainVerified: false,
  gbpMatch: false,
  gbpVerified: false,
  idVerified: false,
  manualVerified: false,
  // GBP-mirror fields — clinic content the claimer supplied; cleared on unclaim.
  placeId: null,
  gbpPrimaryPhone: null,
  additionalPhones: Prisma.DbNull,
  gbpPrimaryCategoryId: null,
  gbpPrimaryCategoryName: null,
  gbpAdditionalCategories: Prisma.DbNull,
  gbpServiceArea: Prisma.DbNull,
  gbpBookingUrl: null,
  gbpFieldsUpdatedAt: null,
  coreClinicId: null,
  coreRegistrationType: null,
  coreUnlinkRequestedAt: null,
  stripeCustomerId: null,
  stripeSubscriptionStatus: null,
  subscriptionCancelAt: null,
  scheduledDeletionAt: null,
} as const

const UNCLAIM_PRACTITIONER_DATA = {
  claimed: false,
  claimedAt: null,
  claimedPlan: null,
  verified: false,
  affiliated: false,
  licensed: false,
  idVerified: false,
  manualVerified: false,
  coreClinicId: null,
  coreRegistrationType: null,
  scheduledDeletionAt: null,
  // Practitioner is the data subject itself — personal fields are scrubbed, not just the claim.
  displayName: 'Removed Practitioner',
  imageUrl: null,
  title: null,
  specialty: null,
  qualifications: [],
  roles: [],
  awards: [],
  media: [],
  experience: [],
} as const

function anonymisedClaimerData(claimId: number) {
  return {
    status: 'deleted' as const,
    claimerName: 'Deleted User',
    claimerEmail: `deleted-claim-${claimId}@anonymised.local`,
    claimerPhone: null,
    newListingData: null,
    // Stripe IDs are dead after purgeClaimBilling() deletes the Customer object — don't
    // leave stale references a future admin could mistake for a live subscription/card.
    stripeSessionId: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  }
}

function findApprovedClaim(entityType: DeletionEntityType, entityId: number) {
  return prisma.claimRequest.findFirst({
    where:
      entityType === 'clinic'
        ? { clinicId: entityId, entityType: 'clinic', status: 'approved' }
        : { practitionerId: entityId, entityType: 'practitioner', status: 'approved' },
    orderBy: { approvedAt: 'desc' },
  })
}

/**
 * Pauses recurring billing the moment deletion is requested — the listing is hidden and
 * portal access is already revoked, so the clinic/practitioner shouldn't keep being charged
 * during the grace period. Uses cancel_at_period_end (not an immediate cancel) so it's fully
 * reversible from cancelScheduledDeletion() if they change their mind within the 7 days —
 * matches the cancellation semantics the Stripe webhook handler already expects.
 */
async function pauseSubscriptionBilling(entityType: DeletionEntityType, entityId: number) {
  const claim = await findApprovedClaim(entityType, entityId)
  if (claim?.selectedPlan !== 'subscription' || !claim.stripeSubscriptionId) return
  await getStripe().subscriptions.update(claim.stripeSubscriptionId, { cancel_at_period_end: true })
}

async function resumeSubscriptionBilling(entityType: DeletionEntityType, entityId: number) {
  const claim = await findApprovedClaim(entityType, entityId)
  if (claim?.selectedPlan !== 'subscription' || !claim.stripeSubscriptionId) return
  const subscription = await getStripe().subscriptions.retrieve(claim.stripeSubscriptionId)
  // Already fully lapsed (grace period spanned a billing renewal) — nothing left to resume,
  // they'd need to resubscribe from the portal.
  if (subscription.status === 'canceled') return
  await getStripe().subscriptions.update(claim.stripeSubscriptionId, { cancel_at_period_end: false })
}

/** Permanent, non-reversible cleanup at purge time: deleting the Stripe Customer cancels any subscription outright and removes stored payment methods in one call. */
async function purgeClaimBilling(claim: { stripeCustomerId: string | null }) {
  if (!claim.stripeCustomerId) return
  await getStripe().customers.del(claim.stripeCustomerId)
}

export async function requestClinicDeletion(clinicId: number) {
  const scheduledDeletionAt = addDays(new Date(), DELETION_GRACE_PERIOD_DAYS)
  await pauseSubscriptionBilling('clinic', clinicId).catch((err) =>
    console.error(`Failed to pause subscription billing for clinic ${clinicId}:`, err),
  )
  await prisma.clinic.update({
    where: { id: clinicId },
    data: { isHidden: true, scheduledDeletionAt },
  })
  await invalidateSearchCache()
  return scheduledDeletionAt
}

export async function requestPractitionerDeletion(practitionerId: number) {
  const scheduledDeletionAt = addDays(new Date(), DELETION_GRACE_PERIOD_DAYS)
  await pauseSubscriptionBilling('practitioner', practitionerId).catch((err) =>
    console.error(`Failed to pause subscription billing for practitioner ${practitionerId}:`, err),
  )
  await prisma.practitioner.update({
    where: { id: practitionerId },
    data: { isHidden: true, scheduledDeletionAt },
  })
  await invalidateSearchCache()
  return scheduledDeletionAt
}

export async function cancelScheduledDeletion(entityType: DeletionEntityType, entityId: number) {
  await resumeSubscriptionBilling(entityType, entityId).catch((err) =>
    console.error(`Failed to resume subscription billing for ${entityType} ${entityId}:`, err),
  )
  if (entityType === 'clinic') {
    await prisma.clinic.update({
      where: { id: entityId },
      data: { isHidden: false, scheduledDeletionAt: null },
    })
  } else {
    await prisma.practitioner.update({
      where: { id: entityId },
      data: { isHidden: false, scheduledDeletionAt: null },
    })
  }
  await invalidateSearchCache()
}

/** Hard-purges a clinic past its grace period: reverts to unclaimed + anonymises the claim. Leads/bookings/chats are untouched — they belong to a different data subject (the patient). */
export async function purgeClinicDeletion(clinicId: number) {
  const approvedClaim = await findApprovedClaim('clinic', clinicId)
  if (approvedClaim) {
    await purgeClaimBilling(approvedClaim).catch((err) =>
      console.error(`Failed to purge Stripe customer for clinic ${clinicId}:`, err),
    )
  }

  await prisma.$transaction([
    prisma.clinic.update({ where: { id: clinicId }, data: UNCLAIM_CLINIC_DATA }),
    // GBP OAuth link + private feedback + review links hold third-party PII with no
    // separate data-subject account — purge them. ClinicAddress / hour periods / services
    // / photos are directory content (like ClinicHour / ClinicFee) and are left in place.
    prisma.gbpConnection.deleteMany({ where: { clinicId } }),
    prisma.privateFeedback.deleteMany({ where: { clinicId } }),
    prisma.reviewRequest.deleteMany({ where: { clinicId } }),
    ...(approvedClaim
      ? [prisma.claimRequest.update({ where: { id: approvedClaim.id }, data: anonymisedClaimerData(approvedClaim.id) })]
      : []),
  ])
}

export async function purgePractitionerDeletion(practitionerId: number) {
  const approvedClaim = await findApprovedClaim('practitioner', practitionerId)
  if (approvedClaim) {
    await purgeClaimBilling(approvedClaim).catch((err) =>
      console.error(`Failed to purge Stripe customer for practitioner ${practitionerId}:`, err),
    )
  }

  await prisma.$transaction([
    prisma.practitioner.update({ where: { id: practitionerId }, data: UNCLAIM_PRACTITIONER_DATA }),
    ...(approvedClaim
      ? [prisma.claimRequest.update({ where: { id: approvedClaim.id }, data: anonymisedClaimerData(approvedClaim.id) })]
      : []),
  ])
}

export async function findExpiredDeletions(now: Date = new Date()) {
  const [clinics, practitioners] = await Promise.all([
    prisma.clinic.findMany({
      where: { scheduledDeletionAt: { lte: now } },
      select: { id: true, slug: true },
    }),
    prisma.practitioner.findMany({
      where: { scheduledDeletionAt: { lte: now } },
      select: { id: true, slug: true },
    }),
  ])
  return { clinics, practitioners }
}

/** Purges every clinic/practitioner whose grace period has elapsed. Called by the daily sweep and by the admin "purge now" action. */
export async function purgeAllExpiredDeletions(now: Date = new Date()) {
  const { clinics, practitioners } = await findExpiredDeletions(now)
  for (const c of clinics) await purgeClinicDeletion(c.id)
  for (const p of practitioners) await purgePractitionerDeletion(p.id)
  return { clinicsPurged: clinics.length, practitionersPurged: practitioners.length }
}
