import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { adminReviewClaimSchema } from '@/lib/schemas/claim.schema'
import { sendClaimApprovedEmail, sendWelcomeEmail } from '@/lib/email'
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

async function provisionConsentzAccount(
  claim: {
    id: number
    entityType: 'clinic' | 'practitioner'
    claimerName: string
    claimerEmail: string
    claimerPhone: string | null
    selectedPlan: string | null
    clinic: { name: string | null; email: string | null; gmapsPhone: string | null } | null
  },
  entityName: string,
  authToken?: string,
  storedRefreshToken?: string,
): Promise<{ newToken?: string; newRefreshToken?: string }> {
  const tempPassword = generateTempPassword()
  let consentzUsername: string | null = null
  let consentzClinicId: number | null = null
  let consentzUserId: number | null = null
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
      }, token)
    )
    consentzUserId = consentzPractitioner.id
    consentzUsername = consentzPractitioner.username

    await prisma.claimRequest.update({
      where: { id: claim.id },
      data: { consentzClinicId, consentzUserId, consentzUsername },
    })
  } catch (err) {
    console.error('[claim] Consentz account provisioning failed — claimId=%d:', claim.id, err)
  }

  if (consentzUsername) {
    await sendWelcomeEmail({
      to: claim.claimerEmail,
      entityName,
      username: consentzUsername,
      tempPassword,
    }).catch(err => console.error('[claim] sendWelcomeEmail failed:', err))
  } else {
    await sendClaimApprovedEmail({
      to: claim.claimerEmail,
      clinicName: entityName,
      plan: PLAN_LABELS[claim.selectedPlan ?? 'free'] ?? 'Free',
    }).catch(err => console.error('[claim] sendClaimApprovedEmail fallback failed:', err))
  }

  const ft = freshTokens as { token: string; refreshToken: string } | null
  return ft ? { newToken: ft.token, newRefreshToken: ft.refreshToken } : {}
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
      const res = NextResponse.json({ success: true })
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

    const entityName =
      claim.entityType === 'practitioner'
        ? (claim.practitioner?.displayName ?? claim.practitionerSlug ?? '')
        : (claim.clinic?.name ?? claim.clinicSlug ?? '')

    if (action === 'approve') {
      if (claim.entityType === 'clinic' && claim.clinicId) {
        await prisma.$transaction([
          prisma.claimRequest.update({
            where: { id },
            data: { status: 'approved', adminNotes: adminNotes ?? null, approvedAt: new Date() },
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
            },
          }),
        ])
      } else if (claim.entityType === 'practitioner' && claim.practitionerId) {
        const licensed = !!claim.licenseNumber
        const verified = claim.affiliated || licensed

        await prisma.$transaction([
          prisma.claimRequest.update({
            where: { id },
            data: { status: 'approved', adminNotes: adminNotes ?? null, approvedAt: new Date() },
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
      }

      const tokens = await provisionConsentzAccount(claim, entityName, authToken, storedRefreshToken)
      const res = NextResponse.json({ success: true })
      applyFreshTokens(res, tokens)
      return res
    } else {
      await prisma.claimRequest.update({
        where: { id },
        data: { status: 'rejected', adminNotes: adminNotes ?? null, rejectedAt: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin claim review error:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}
