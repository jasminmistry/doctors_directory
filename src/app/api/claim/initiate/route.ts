import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { initiateClaimSchema } from '@/lib/schemas/claim.schema'
import { generateOtp, otpExpiresAt, isGenericEmailDomain } from '@/lib/claim-utils'
import { sendClaimOtp } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = initiateClaimSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    if (data.entityType === 'clinic') {
      const { clinicSlug, claimerName, claimerEmail, clinicNameInput, clinicPhone, clinicWebsite, googleBusinessLink } = data

      const clinic = await prisma.clinic.findUnique({
        where: { slug: clinicSlug },
        select: { id: true, name: true, slug: true, claimed: true },
      })

      if (!clinic) {
        return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
      }
      if (clinic.claimed) {
        return NextResponse.json({ error: 'This profile has already been claimed' }, { status: 409 })
      }

      const requiresManualReview = isGenericEmailDomain(claimerEmail)

      await prisma.claimRequest.updateMany({
        where: {
          clinicId: clinic.id,
          claimerEmail,
          status: { in: ['pending_otp', 'otp_verified'] },
        },
        data: { status: 'rejected' },
      })

      const otp = generateOtp()
      const claim = await prisma.claimRequest.create({
        data: {
          entityType: 'clinic',
          clinicId: clinic.id,
          clinicSlug: clinic.slug,
          claimerName,
          claimerEmail,
          claimerPhone: clinicPhone,
          clinicNameInput,
          clinicPhone,
          clinicWebsite: clinicWebsite || null,
          googleBusinessLink: googleBusinessLink || null,
          requiresManualReview,
          otpCode: otp,
          otpExpiresAt: otpExpiresAt(),
          status: 'pending_otp',
        },
      })

      await sendClaimOtp({ to: claimerEmail, entityName: clinic.name ?? clinicSlug, otp })

      return NextResponse.json({ claimId: claim.id, message: 'Verification code sent' })
    }

    // Practitioner
    const { practitionerSlug, claimerName, claimerEmail, claimerPhone, profession, clinicNameInput, licenseNumber, registryName } = data

    const practitioner = await prisma.practitioner.findUnique({
      where: { slug: practitionerSlug },
      select: { id: true, displayName: true, slug: true, claimed: true },
    })

    if (!practitioner) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 })
    }
    if (practitioner.claimed) {
      return NextResponse.json({ error: 'This profile has already been claimed' }, { status: 409 })
    }

    const requiresManualReview = isGenericEmailDomain(claimerEmail)

    await prisma.claimRequest.updateMany({
      where: {
        practitionerId: practitioner.id,
        claimerEmail,
        status: { in: ['pending_otp', 'otp_verified'] },
      },
      data: { status: 'rejected' },
    })

    const otp = generateOtp()
    const claim = await prisma.claimRequest.create({
      data: {
        entityType: 'practitioner',
        practitionerId: practitioner.id,
        practitionerSlug: practitioner.slug,
        claimerName,
        claimerEmail,
        claimerPhone: claimerPhone ?? null,
        profession,
        clinicNameInput: clinicNameInput ?? null,
        licenseNumber: licenseNumber ?? null,
        registryName: registryName ?? null,
        requiresManualReview,
        otpCode: otp,
        otpExpiresAt: otpExpiresAt(),
        status: 'pending_otp',
      },
    })

    const entityName = practitioner.displayName ?? practitionerSlug
    await sendClaimOtp({ to: claimerEmail, entityName, otp })

    return NextResponse.json({ claimId: claim.id, message: 'Verification code sent' })
  } catch (error) {
    console.error('Claim initiate error:', error)
    return NextResponse.json({ error: 'Failed to initiate claim' }, { status: 500 })
  }
}
