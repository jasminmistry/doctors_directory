import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyOtpSchema } from '@/lib/schemas/claim.schema'
import { isOtpExpired, isDomainMatch } from '@/lib/claim-utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = verifyOtpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { claimId, otp } = parsed.data

    const claim = await prisma.claimRequest.findUnique({
      where: { id: claimId },
      include: {
        clinic: { select: { website: true, gmapsPhone: true } },
        practitioner: {
          include: {
            clinicAssociations: {
              include: { clinic: { select: { website: true } } },
            },
          },
        },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    if (claim.status !== 'pending_otp') {
      return NextResponse.json({ error: 'Invalid claim state' }, { status: 400 })
    }
    if (!claim.otpCode || !claim.otpExpiresAt) {
      return NextResponse.json({ error: 'No OTP on record' }, { status: 400 })
    }
    if (isOtpExpired(claim.otpExpiresAt)) {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
    }
    if (claim.otpCode !== otp) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
    }

    // Auto-verify domain / affiliation / GBP match
    let domainVerified = false
    let affiliated = false
    let gbpMatch = false

    if (claim.entityType === 'clinic') {
      if (claim.clinic?.website) {
        domainVerified = isDomainMatch(claim.claimerEmail, claim.clinic.website)
      }
      // GBP match: submitted phone matches the clinic's Google Maps phone
      if (claim.claimerPhone && claim.clinic?.gmapsPhone) {
        const normalize = (p: string) => p.replace(/[\s\-().+]/g, '')
        gbpMatch = normalize(claim.claimerPhone) === normalize(claim.clinic.gmapsPhone)
      }
    }

    if (claim.entityType === 'practitioner' && claim.practitioner) {
      const websites = claim.practitioner.clinicAssociations
        .map((a) => a.clinic.website)
        .filter(Boolean) as string[]
      affiliated = websites.some((w) => isDomainMatch(claim.claimerEmail, w))
    }

    await prisma.claimRequest.update({
      where: { id: claimId },
      data: {
        status: 'otp_verified',
        otpVerifiedAt: new Date(),
        otpCode: null,
        otpExpiresAt: null,
        domainVerified,
        affiliated,
      },
    })

    return NextResponse.json({ domainVerified, affiliated, gbpMatch })
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}
