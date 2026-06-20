export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { consentzLinkSchema } from '@/lib/schemas/claim.schema'
import { getConsentzV1Url } from '@/lib/auth'

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

    const { token, consentzClinicId, consentzUserId, consentzUsername, consentzSessionToken } = parsed.data

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

    // 2. Verify the Consentz session belongs to the stated clinic.
    // Only checked when a session token is present — web-form-login users may
    // not have a Device record, in which case we rely on Consentz's own
    // IS_AUTHENTICATED_FULLY guard + clinic ownership check on their side.
    if (consentzSessionToken) {
      const sessionValid = await verifyConsentzSession(consentzSessionToken, consentzClinicId)
      if (!sessionValid) {
        return NextResponse.json({ error: 'Could not verify your Consentz session. Please log in again.' }, { status: 401 })
      }
    }

    // 3. Check the directory entity is not already claimed
    if (claim.entityType === 'clinic' && claim.clinicId) {
      const clinic = await prisma.clinic.findUnique({
        where: { id: claim.clinicId },
        select: { claimed: true },
      })
      if (clinic?.claimed) {
        return NextResponse.json({ error: 'already_claimed' }, { status: 409 })
      }
    } else if (claim.entityType === 'practitioner' && claim.practitionerId) {
      const practitioner = await prisma.practitioner.findUnique({
        where: { id: claim.practitionerId },
        select: { claimed: true },
      })
      if (practitioner?.claimed) {
        return NextResponse.json({ error: 'already_claimed' }, { status: 409 })
      }
    }

    // 4. Mark token used and advance claim to pending_approval
    await prisma.claimRequest.update({
      where: { id: claim.id },
      data: {
        linkTokenUsed:    true,
        status:           'pending_approval',
        selectedPlan:     'free',
        consentzClinicId,
        consentzUserId,
        consentzUsername,
      },
    })

    // 5. Mark entity as claimed and link coreClinicId
    if (claim.entityType === 'clinic' && claim.clinicId) {
      await prisma.clinic.update({
        where: { id: claim.clinicId },
        data: {
          claimed:       true,
          claimedAt:     new Date(),
          claimedPlan:   'free',
          coreClinicId:  consentzClinicId,
        },
      })
    } else if (claim.entityType === 'practitioner' && claim.practitionerId) {
      await prisma.practitioner.update({
        where: { id: claim.practitionerId },
        data: {
          claimed:     true,
          claimedAt:   new Date(),
          claimedPlan: 'free',
        },
      })
    }

    // 6. Return success — the Consentz page redirects through /admin/directory-sso
    // which generates an HMAC SSO token and sets auth cookies in the browser.
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Consentz link error:', error)
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 })
  }
}
