import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { adminReviewClaimSchema } from '@/lib/schemas/claim.schema'
import { sendClaimApprovedEmail, sendClaimRejectedEmail, sendWelcomeEmail } from '@/lib/email'
import {
  COOKIE_TOKEN,
  COOKIE_REFRESH,
  COOKIE_OPTS,
  generateTempPassword,
  refreshConsentzToken,
  registerConsentzClinic,
  registerConsentzPractitioner,
  splitName,
} from '@/lib/auth'
import { PLAN_LABELS } from '@/lib/claim-utils'
import { sendMpEvents } from '@/lib/analytics/measurement-protocol'
import { invalidateSearchCache } from '@/lib/search-cache'
import { createClinic } from '@/lib/data-access/clinics'
import { createPractitioner, invalidatePractitionersSearchCache } from '@/lib/data-access/practitioners'
import { findOrCreateCityByName } from '@/lib/data-access/cities'
import { cleanRouteSlug } from '@/lib/utils'

interface NewClinicListingData {
  clinicNameInput?: string
  address?: string
  city?: string
  category?: string
  about?: string
}

interface NewPractitionerListingData {
  fullName?: string
  profession?: string
  clinicNameInput?: string
  city?: string
  about?: string
}

async function makeUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const cleaned = cleanRouteSlug(base || '') || 'listing'
  let slug = cleaned
  let i = 2
  while (await exists(slug)) {
    slug = `${cleaned}-${i++}`
  }
  return slug
}

async function provisionConsentzAccount(
  claim: {
    id: number
    entityType: 'clinic' | 'practitioner'
    clinicId: number | null
    practitionerId: number | null
    claimerName: string
    claimerEmail: string
    claimerPhone: string | null
    selectedPlan: string | null
    attributionSource: string | null
    attributionLandingPage: string | null
    attributionReferrer: string | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    clinic: { name: string | null; email: string | null; gmapsPhone: string | null } | null
  },
  entityName: string,
  authToken?: string,
  storedRefreshToken?: string,
): Promise<{ newToken?: string; newRefreshToken?: string; provisioningFailed: boolean }> {
  const tempPassword = generateTempPassword()
  let consentzUsername: string | null = null
  let consentzClinicId: number | null = null
  let consentzUserId: number | null = null
  let isNewAccount = false
  let freshTokens: { token: string; refreshToken: string } | null = null

  const clinicEmail =
    claim.entityType === 'clinic'
      ? (claim.clinic?.email ?? claim.claimerEmail)
      : claim.claimerEmail
  const clinicName =
    claim.entityType === 'clinic' ? entityName : `${entityName} Practice`

  async function getToken(): Promise<string | undefined> {
    if (freshTokens) return freshTokens.token
    return authToken
  }

  async function tryWithRefresh<T>(fn: (token: string | undefined) => Promise<T>): Promise<T> {
    try {
      return await fn(await getToken())
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      if (status === 401 && storedRefreshToken && !freshTokens) {
        freshTokens = await refreshConsentzToken(storedRefreshToken)
        if (freshTokens) {
          return fn(freshTokens.token)
        }
      }
      throw err
    }
  }

  try {
    const consentzClinic = await tryWithRefresh((token) =>
      registerConsentzClinic({
        name: clinicName,
        email: clinicEmail,
        phone: claim.claimerPhone,
        contactName: claim.claimerName,
        source: claim.attributionSource,
        sourceLandingPage: claim.attributionLandingPage,
        sourceReferrer: claim.attributionReferrer,
        sourceUtm:
          claim.utmSource || claim.utmMedium || claim.utmCampaign
            ? { source: claim.utmSource, medium: claim.utmMedium, campaign: claim.utmCampaign }
            : null,
      }, token)
    )
    consentzClinicId = consentzClinic.id

    const { firstName, lastName } = splitName(claim.claimerName)
    const consentzPractitioner = await tryWithRefresh((token) =>
      registerConsentzPractitioner({
        clinicId: consentzClinic.id,
        firstName,
        lastName,
        email: claim.claimerEmail,
        password: tempPassword,
        role: 'ROLE_CLINIC_ADMIN',
      }, token)
    )
    consentzUserId = consentzPractitioner.id
    consentzUsername = consentzPractitioner.username
    // Only genuinely new accounts have their password set to tempPassword — a 409
    // means Consentz already had this practitioner and returned the existing record
    // untouched, so tempPassword would NOT match their real password (causes 401 on login).
    isNewAccount = consentzPractitioner.isNew

    await prisma.claimRequest.update({
      where: { id: claim.id },
      data: { consentzClinicId, consentzUserId, consentzUsername },
    })

    if (claim.entityType === 'clinic' && claim.clinicId && consentzClinicId) {
      await prisma.clinic.update({
        where: { id: claim.clinicId },
        data: { coreClinicId: consentzClinicId, coreRegistrationType: 'new_registration' },
      }).catch(err => console.error('[claim] Failed to copy coreClinicId to clinic:', err))
    } else if (claim.entityType === 'practitioner' && claim.practitionerId && consentzClinicId) {
      await prisma.practitioner.update({
        where: { id: claim.practitionerId },
        data: { coreClinicId: consentzClinicId, coreRegistrationType: 'new_registration' },
      }).catch(err => console.error('[claim] Failed to copy coreClinicId to practitioner:', err))
    }
  } catch (err) {
    console.error('[claim] Consentz account provisioning failed — claimId=%d:', claim.id, err)
  }

  if (consentzUsername && isNewAccount) {
    await sendWelcomeEmail({
      to: claim.claimerEmail,
      entityName,
      username: consentzUsername,
      tempPassword,
    }).catch(err => console.error('[claim] sendWelcomeEmail failed:', err))
  } else if (consentzUsername && !isNewAccount) {
    // Consentz already had this account (409 on register) — its real password is
    // unknown to us, so we must not email tempPassword since it was never actually
    // applied on Consentz's side. They can still use their existing credentials.
    console.warn('[claim] Consentz account already existed for claimId=%d (username=%s) — skipping welcome email with fabricated password', claim.id, consentzUsername)
    await sendClaimApprovedEmail({
      to: claim.claimerEmail,
      clinicName: entityName,
      plan: PLAN_LABELS[claim.selectedPlan ?? 'free'] ?? 'Free',
    }).catch(err => console.error('[claim] sendClaimApprovedEmail fallback failed:', err))
  } else {
    // Provisioning failed outright — no Consentz account exists at all (commonly a
    // 401 from Core because the reviewing admin's session token had expired, and the
    // refresh attempt above also failed). Do NOT tell the clinic they can log in —
    // they have no working account yet. Surfaced to the admin via provisioningFailed
    // below; retrying (after the admin refreshes their own Consentz session) via the
    // "Reprovision" action will send the real welcome email once it actually succeeds.
    console.error('[claim] Consentz provisioning failed outright for claimId=%d — no account created, no email sent', claim.id)
  }

  const ft = freshTokens as { token: string; refreshToken: string } | null
  return {
    ...(ft ? { newToken: ft.token, newRefreshToken: ft.refreshToken } : {}),
    provisioningFailed: !consentzUsername,
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid claim ID' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = adminReviewClaimSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { action, adminNotes } = parsed.data
    const authToken = req.cookies.get(COOKIE_TOKEN)?.value
    const storedRefreshToken = req.cookies.get(COOKIE_REFRESH)?.value

    function applyFreshTokens(res: NextResponse, tokens: { newToken?: string; newRefreshToken?: string }) {
      if (tokens.newToken) res.cookies.set(COOKIE_TOKEN, tokens.newToken, COOKIE_OPTS)
      if (tokens.newRefreshToken) res.cookies.set(COOKIE_REFRESH, tokens.newRefreshToken, COOKIE_OPTS)
    }

    const claim = await prisma.claimRequest.findUnique({
      where: { id },
      include: {
        clinic: { select: { name: true, gmapsPhone: true, email: true } },
        practitioner: { select: { displayName: true } },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // mark_paid: admin manually advances otp_verified → pending_approval when
    // the Stripe webhook didn't fire (e.g. stripe listen not running in local dev)
    if (action === 'mark_paid') {
      if (claim.status !== 'otp_verified') {
        return NextResponse.json({ error: 'Claim must be in otp_verified state' }, { status: 400 })
      }
      await prisma.claimRequest.update({
        where: { id },
        data: { status: 'pending_approval' },
      })
      return NextResponse.json({ success: true })
    }

    // reprovision: re-run Consentz account creation for an approved claim where
    // provisioning previously failed (consentzUserId is null)
    if (action === 'reprovision') {
      if (claim.status !== 'approved') {
        return NextResponse.json({ error: 'Claim must be approved to reprovision' }, { status: 400 })
      }
      if (claim.consentzUserId) {
        return NextResponse.json({ error: 'Consentz account already provisioned' }, { status: 400 })
      }
      const entityName =
        claim.entityType === 'practitioner'
          ? (claim.practitioner?.displayName ?? claim.practitionerSlug ?? '')
          : (claim.clinic?.name ?? claim.clinicSlug ?? '')
      const tokens = await provisionConsentzAccount(claim, entityName, authToken, storedRefreshToken)
      const res = NextResponse.json({ success: true, provisioningFailed: tokens.provisioningFailed })
      applyFreshTokens(res, tokens)
      return res
    }
    if (action === 'approve' && claim.status === 'approved') {
      return NextResponse.json({ success: true, alreadyApproved: true })
    }

    if (claim.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Cannot ${action} a claim with status "${claim.status}"` },
        { status: 400 },
      )
    }

    // New registrations have no existing Clinic/Practitioner row — create one now,
    // before the shared approve/reject logic below (which operates on claim.clinicId /
    // claim.practitionerId) runs. Leave `claimed` false here; the transaction further
    // down sets claimed/claimedAt/claimedPlan the same way it does for ordinary claims.
    if (action === 'approve' && claim.isNewRegistration) {
      if (claim.entityType === 'clinic' && !claim.clinicId) {
        const listing: NewClinicListingData = claim.newListingData ? JSON.parse(claim.newListingData) : {}
        const slug = await makeUniqueSlug(
          listing.clinicNameInput || claim.clinicNameInput || 'clinic',
          (s) => prisma.clinic.findUnique({ where: { slug: s }, select: { id: true } }).then(Boolean),
        )
        const cityId = listing.city ? await findOrCreateCityByName(listing.city) : null
        const newClinic = await createClinic({
          slug,
          name: listing.clinicNameInput || claim.clinicNameInput || undefined,
          category: listing.category || undefined,
          gmapsAddress: [listing.address, listing.city].filter(Boolean).join(', ') || undefined,
          gmapsPhone: claim.clinicPhone || undefined,
          website: claim.clinicWebsite || undefined,
          email: claim.claimerEmail,
          aboutSection: listing.about || undefined,
          ...(cityId ? { city: { connect: { id: cityId } } } : {}),
        })
        claim.clinicId = newClinic.id
        claim.clinicSlug = newClinic.slug
        // No independent source (e.g. Google Maps) to verify against for a brand-new listing.
        claim.clinic = { name: null, email: newClinic.email, gmapsPhone: null }
      } else if (claim.entityType === 'practitioner' && !claim.practitionerId) {
        const listing: NewPractitionerListingData = claim.newListingData ? JSON.parse(claim.newListingData) : {}

        // A practitioner has no city of its own — city is only ever derived via its
        // clinic association (see PractitionerClinicAssociation). Self-registered
        // practitioners have no existing clinic to attach to, so create a lightweight
        // one from their registration answers, mirroring the clinic registration branch
        // above so the practitioner ends up with a real city/profile URL.
        const cityId = listing.city ? await findOrCreateCityByName(listing.city) : null
        const clinicName = listing.clinicNameInput || `${listing.fullName || claim.claimerName}'s Practice`
        const clinicSlug = await makeUniqueSlug(
          clinicName,
          (s) => prisma.clinic.findUnique({ where: { slug: s }, select: { id: true } }).then(Boolean),
        )
        const newClinic = await createClinic({
          slug: clinicSlug,
          name: clinicName,
          email: claim.claimerEmail,
          aboutSection: listing.about || undefined,
          ...(cityId ? { city: { connect: { id: cityId } } } : {}),
        })

        const slug = await makeUniqueSlug(
          listing.fullName || claim.claimerName || 'practitioner',
          (s) => prisma.practitioner.findUnique({ where: { slug: s }, select: { id: true } }).then(Boolean),
        )
        const newPractitioner = await createPractitioner({
          slug,
          displayName: listing.fullName || claim.claimerName,
          specialty: listing.profession || claim.profession || undefined,
          clinicAssociations: { create: { clinicId: newClinic.id } },
        })
        claim.practitionerId = newPractitioner.id
        claim.practitionerSlug = newPractitioner.slug
        claim.practitioner = { displayName: newPractitioner.displayName }
      }
    }

    const entityName =
      claim.entityType === 'practitioner'
        ? (claim.practitioner?.displayName ?? claim.practitionerSlug ?? '')
        : (claim.clinic?.name ?? claim.clinicSlug ?? '')

    if (action === 'approve') {
      if (claim.entityType === 'clinic' && claim.clinicId) {
        await prisma.$transaction([
          prisma.claimRequest.update({
            where: { id },
            data: {
              status: 'approved',
              adminNotes: adminNotes ?? null,
              approvedAt: new Date(),
              ...(claim.isNewRegistration ? { clinicId: claim.clinicId, clinicSlug: claim.clinicSlug } : {}),
            },
          }),
          prisma.clinic.update({
            where: { id: claim.clinicId },
            data: {
              claimed: true,
              claimedAt: new Date(),
              claimedPlan: claim.selectedPlan ?? 'free',
              domainVerified: claim.domainVerified,
              gbpMatch: claim.domainVerified ? false : (() => {
                if (!claim.claimerPhone || !claim.clinic?.gmapsPhone) return false
                const n = (p: string) => p.replace(/[\s\-().+]/g, '')
                return n(claim.claimerPhone) === n(claim.clinic.gmapsPhone)
              })(),
              verified: claim.domainVerified,
              // Preserve clinic name entered during claim if the record has no name
              ...(!claim.clinic?.name && claim.clinicNameInput ? { name: claim.clinicNameInput } : {}),
              // Copy Stripe customer ID if the webhook already stored it on the claim
              ...(claim.stripeCustomerId ? { stripeCustomerId: claim.stripeCustomerId } : {}),
            },
          }),
        ])
        await invalidateSearchCache()
      } else if (claim.entityType === 'practitioner' && claim.practitionerId) {
        const licensed = !!claim.licenseNumber
        const verified = claim.affiliated || licensed

        await prisma.$transaction([
          prisma.claimRequest.update({
            where: { id },
            data: {
              status: 'approved',
              adminNotes: adminNotes ?? null,
              approvedAt: new Date(),
              ...(claim.isNewRegistration ? { practitionerId: claim.practitionerId, practitionerSlug: claim.practitionerSlug } : {}),
            },
          }),
          prisma.practitioner.update({
            where: { id: claim.practitionerId },
            data: {
              claimed: true,
              claimedAt: new Date(),
              claimedPlan: claim.selectedPlan ?? 'free',
              affiliated: claim.affiliated,
              licensed,
              verified,
            },
          }),
        ])
        await invalidateSearchCache()
        await invalidatePractitionersSearchCache()
      }

      // Carry the GA4 client id onto the live entity so later server-side events
      // (lead-unlock purchase, etc.) attribute to the same GA user.
      if (claim.gaClientId) {
        if (claim.clinicId) {
          await prisma.clinic.update({ where: { id: claim.clinicId }, data: { gaClientId: claim.gaClientId } }).catch(() => {})
        } else if (claim.practitionerId) {
          await prisma.practitioner.update({ where: { id: claim.practitionerId }, data: { gaClientId: claim.gaClientId } }).catch(() => {})
        }
      }

      // Server-side GA4 `sign_up_approved` — the real "approved & provisioned"
      // outcome. Kept as a distinct event from the client-side `sign_up`
      // ("submitted") so the key-event conversion isn't double-counted.
      await sendMpEvents(claim.gaClientId, [
        {
          name: 'sign_up_approved',
          params: {
            method: 'directory_claim',
            entity_type: claim.entityType,
            user_type: claim.entityType,
            plan: claim.selectedPlan ?? 'free',
            source_bucket: claim.attributionSource ?? undefined,
            landing_page: claim.attributionLandingPage ?? undefined,
          },
        },
      ])

      // Consentz-linked claims already have an account — skip provisioning but still notify
      if (claim.consentzUserId) {
        await sendClaimApprovedEmail({
          to: claim.claimerEmail,
          clinicName: entityName,
          plan: PLAN_LABELS[claim.selectedPlan ?? 'free'] ?? 'Free',
        }).catch(err => console.error('[claim] sendClaimApprovedEmail (consentz-linked) failed:', err))
        return NextResponse.json({ success: true })
      }

      const tokens = await provisionConsentzAccount(claim, entityName, authToken, storedRefreshToken)
      const res = NextResponse.json({ success: true, provisioningFailed: tokens.provisioningFailed })
      applyFreshTokens(res, tokens)
      return res
    } else {
      await prisma.claimRequest.update({
        where: { id },
        data: { status: 'rejected', adminNotes: adminNotes ?? null, rejectedAt: new Date() },
      })

      // Consentz-linked claims set clinic.claimed=true at link time (before admin approval),
      // so rejection must undo that to allow the clinic to be claimed again.
      if (claim.consentzClinicId && claim.clinicId) {
        await prisma.clinic.update({
          where: { id: claim.clinicId },
          data: {
            claimed:              false,
            claimedAt:            null,
            claimedPlan:          null,
            coreClinicId:         null,
            coreRegistrationType: null,
          },
        }).catch(err => console.error('[claim] Failed to reset clinic on Consentz-link rejection:', err))
      }

      await sendClaimRejectedEmail({
        to: claim.claimerEmail,
        entityName,
        adminNotes,
      }).catch(err => console.error('[claim] sendClaimRejectedEmail failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin claim review error:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}
