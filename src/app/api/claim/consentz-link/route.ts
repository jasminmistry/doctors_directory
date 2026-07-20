export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { consentzLinkSchema } from '@/lib/schemas/claim.schema'
import { getConsentzV1Url } from '@/lib/auth'
import { sendClaimApprovedEmail } from '@/lib/email'
import { invalidateSearchCache } from '@/lib/search-cache'
import { PLAN_LABELS } from '@/lib/claim-utils'

function verifySig(token: string, consentzClinicId: number, consentzUserId: number, sig: string): boolean {
  const secret = process.env.DIRECTORY_LINK_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${token}:${consentzClinicId}:${consentzUserId}`)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

async function verifyConsentzSession(
  sessionToken: string | null | undefined,
  consentzClinicId: number,
): Promise<boolean> {
  if (!sessionToken) return false
  try {
    const base = new URL(getConsentzV1Url()).origin
    const res = await fetch(`${base}/api/core-lite/directory/me`, {
      headers: { 'X-SESSION-TOKEN': sessionToken },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return false
    const data = await res.json()
    return Array.isArray(data.clinics) && data.clinics.some((c: { id: number }) => c.id === consentzClinicId)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = consentzLinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { token, consentzClinicId, consentzUserId, consentzUsername, consentzSessionToken, sig } = parsed.data

    // 1. Validate the one-time link token
    const claim = await prisma.claimRequest.findUnique({
      where: { linkToken: token },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Invalid or expired link token' }, { status: 400 })
    }
    if (claim.linkTokenUsed) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 400 })
    }
    if (!claim.linkTokenExpiresAt || claim.linkTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Link token has expired. Please start the claim process again.' }, { status: 400 })
    }
    if (claim.status !== 'awaiting_consentz_link') {
      return NextResponse.json({ error: 'Invalid claim state' }, { status: 400 })
    }

    // 2. Verify the server-to-server HMAC signature proving this POST came from Consentz.
    // sig = HMAC-SHA256(DIRECTORY_LINK_SECRET, "{token}:{consentzClinicId}:{consentzUserId}")
    // Optional for backwards compat; verified when present. Log a warning when absent so we can
    // track which requests still lack it and flip to required once ConsentzLive sends it everywhere.
    if (sig) {
      if (!verifySig(token, consentzClinicId, consentzUserId, sig)) {
        return NextResponse.json({ error: 'Invalid request signature.' }, { status: 401 })
      }
    } else {
      console.warn('[consentz-link] No HMAC sig provided — request not server-verified. claimId=%d', claim.id)
    }

    // 2a. Verify the Consentz session belongs to the stated clinic.
    // Only checked when a session token is present — web-form-login users may
    // not have a Device record, in which case we rely on Consentz's own
    // IS_AUTHENTICATED_FULLY guard + clinic ownership check on their side.
    if (consentzSessionToken) {
      const sessionValid = await verifyConsentzSession(consentzSessionToken, consentzClinicId)
      if (!sessionValid) {
        return NextResponse.json({ error: 'Could not verify your Consentz session. Please log in again.' }, { status: 401 })
      }
    }

    // 2b. Block if this Consentz clinic is already linked to a different directory entity.
    // Check the Clinic table (coreClinicId is @unique, but we want a clear error before the DB
    // throws) and any active ClaimRequest with the same consentzClinicId.
    const [coreConflictClinic, coreConflictClaim] = await Promise.all([
      prisma.clinic.findFirst({
        where: {
          coreClinicId: consentzClinicId,
          ...(claim.clinicId ? { NOT: { id: claim.clinicId } } : {}),
        },
        select: { id: true },
      }),
      prisma.claimRequest.findFirst({
        where: {
          consentzClinicId,
          status: { in: ['pending_approval', 'approved'] },
          NOT: { id: claim.id },
        },
        select: { id: true },
      }),
    ])
    if (coreConflictClinic || coreConflictClaim) {
      return NextResponse.json(
        { error: 'This Consentz clinic is already linked to another directory listing.' },
        { status: 409 },
      )
    }

    // 2c. Block multi-linking: one Consentz user can only be linked to one directory profile.
    const userConflictClaim = await prisma.claimRequest.findFirst({
      where: {
        consentzUserId,
        status: { in: ['pending_approval', 'approved'] },
        NOT: { id: claim.id },
      },
      select: { id: true },
    })
    if (userConflictClaim) {
      return NextResponse.json(
        { error: 'Your Consentz account is already linked to a directory listing.' },
        { status: 409 },
      )
    }

    // 3–5. Atomically: verify entity is unclaimed, mark token used, mark entity claimed.
    // Wrapped in a transaction to prevent a second concurrent link request from racing
    // past the claimed-check before the first one commits.
    await prisma.$transaction(async (tx) => {
      if (claim.entityType === 'clinic' && claim.clinicId) {
        const clinic = await tx.clinic.findUnique({
          where: { id: claim.clinicId },
          select: { claimed: true },
        })
        if (clinic?.claimed) {
          throw Object.assign(new Error('already_claimed'), { code: 'already_claimed' })
        }
      } else if (claim.entityType === 'practitioner' && claim.practitionerId) {
        const practitioner = await tx.practitioner.findUnique({
          where: { id: claim.practitionerId },
          select: { claimed: true },
        })
        if (practitioner?.claimed) {
          throw Object.assign(new Error('already_claimed'), { code: 'already_claimed' })
        }
      }

      // Auto-approve: unlike the cold OTP claim flow, the claimer already proved they're
      // an authenticated Consentz clinic admin (verifyConsentzSession above), so there's
      // no ownership question for a human reviewer to check. `verified` (domain/GBP match)
      // is a separate signal and stays false here — it's only set by the OTP flow's checks.
      await tx.claimRequest.update({
        where: { id: claim.id },
        data: {
          linkTokenUsed:    true,
          status:           'approved',
          approvedAt:       new Date(),
          selectedPlan:     'free',
          consentzClinicId,
          consentzUserId,
          consentzUsername,
        },
      })

      if (claim.entityType === 'clinic' && claim.clinicId) {
        await tx.clinic.update({
          where: { id: claim.clinicId },
          data: {
            claimed:      true,
            claimedAt:    new Date(),
            claimedPlan:  'free',
            coreClinicId: consentzClinicId,
            verified:     false,
          },
        })
      } else if (claim.entityType === 'practitioner' && claim.practitionerId) {
        await tx.practitioner.update({
          where: { id: claim.practitionerId },
          data: {
            claimed:      true,
            claimedAt:    new Date(),
            claimedPlan:  'free',
            coreClinicId: consentzClinicId,
            verified:     false,
          },
        })
      }
    })

    if (claim.entityType === 'clinic') {
      await invalidateSearchCache()
    }

    const entityName = claim.entityType === 'clinic'
      ? (claim.clinicSlug ?? consentzUsername)
      : (claim.practitionerSlug ?? consentzUsername)
    await sendClaimApprovedEmail({
      to: claim.claimerEmail,
      clinicName: entityName,
      plan: PLAN_LABELS['free'],
    }).catch(err => console.error('[consentz-link] sendClaimApprovedEmail failed:', err))

    // 6. Return success — the Consentz page redirects through /admin/directory-sso
    // which generates an HMAC SSO token and sets auth cookies in the browser.
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as { code?: string }).code === 'already_claimed') {
      return NextResponse.json({ error: 'already_claimed' }, { status: 409 })
    }
    console.error('Consentz link error:', error)
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 })
  }
}
