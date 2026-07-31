export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resendOtpSchema } from '@/lib/schemas/claim.schema'
import { generateOtp, otpExpiresAt } from '@/lib/claim-utils'
import { sendClaimOtp } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resendOtpSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { claimId } = parsed.data

    const claim = await prisma.claimRequest.findUnique({
      where: { id: claimId },
      include: {
        clinic: { select: { name: true } },
        practitioner: { select: { displayName: true } },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    if (claim.status !== 'pending_otp') {
      return NextResponse.json({ error: 'This claim is no longer awaiting verification.' }, { status: 400 })
    }

    const entityName = claim.isNewRegistration
      ? (claim.clinicNameInput ?? claim.claimerName)
      : (claim.clinic?.name ?? claim.practitioner?.displayName ?? claim.clinicSlug ?? claim.practitionerSlug ?? claim.claimerName)

    const otp = generateOtp()
    await prisma.claimRequest.update({
      where: { id: claimId },
      data: { otpCode: otp, otpExpiresAt: otpExpiresAt() },
    })

    await sendClaimOtp({ to: claim.claimerEmail, entityName, otp })

    return NextResponse.json({ message: 'Verification code sent' })
  } catch (error) {
    console.error('Claim resend-otp error:', error)
    return NextResponse.json({ error: 'Failed to resend code' }, { status: 500 })
  }
}
