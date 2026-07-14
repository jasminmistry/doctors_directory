export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { initiateClaimSchema } from '@/lib/schemas/claim.schema'
import { generateOtp, otpExpiresAt, isGenericEmailDomain, hasCompetingActiveClaim } from '@/lib/claim-utils'
import { domainHasMailServer } from '@/lib/email-domain-check'
import { sendClaimOtp } from '@/lib/email'
import { getConsentzV1Url } from '@/lib/auth'

function generateLinkToken(): string {
  return crypto.randomBytes(40).toString('hex')
}

function linkTokenExpiresAt(): Date {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

async function cityExists(name: string): Promise<boolean> {
  const city = await prisma.city.findFirst({ where: { name: { equals: name.trim() } }, select: { id: true } })
  return !!city
}

async function isExistingConsentzUser(email: string): Promise<boolean> {
  try {
    const base = new URL(getConsentzV1Url()).origin
    const res = await fetch(`${base}/api/core-lite/directory/check-user?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.exists === true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = initiateClaimSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const data = parsed.data

    if (!(await domainHasMailServer(data.claimerEmail))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (data.entityType === 'clinic' && data.isNewRegistration) {
      const { claimerName, claimerEmail, clinicNameInput, clinicPhone, clinicWebsite, googleBusinessLink, address, city, category, about } = data

      if (!(await cityExists(city))) {
        return NextResponse.json({ error: 'Please select a valid city from the list.' }, { status: 400 })
      }

      const requiresManualReview = isGenericEmailDomain(claimerEmail)
      const otp = generateOtp()
      const claim = await prisma.claimRequest.create({
        data: {
          entityType: 'clinic',
          isNewRegistration: true,
          newListingData: JSON.stringify({ clinicNameInput, address, city, category, about }),
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

      await sendClaimOtp({ to: claimerEmail, entityName: clinicNameInput, otp })

      return NextResponse.json({ claimId: claim.id, entityName: clinicNameInput, message: 'Verification code sent' })
    }

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
      if (await hasCompetingActiveClaim({ entityType: 'clinic', entityId: clinic.id, claimerEmail })) {
        return NextResponse.json({ error: 'A claim request for this profile is already under review' }, { status: 409 })
      }

      // Check if the email is already registered in Consentz
      const consentzUserExists = await isExistingConsentzUser(claimerEmail)
      if (consentzUserExists) {
        // Cancel any stale pending link records for this email + clinic
        await prisma.claimRequest.updateMany({
          where: {
            clinicId: clinic.id,
            claimerEmail,
            status: 'awaiting_consentz_link',
          },
          data: { status: 'rejected' },
        })

        const token = generateLinkToken()
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
            requiresManualReview: false,
            status: 'awaiting_consentz_link',
            linkToken: token,
            linkTokenExpiresAt: linkTokenExpiresAt(),
          },
        })

        return NextResponse.json({
          consentzUserExists: true,
          claimId: claim.id,
          linkToken: token,
        })
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
    if (data.isNewRegistration) {
      const { claimerName, claimerEmail, claimerPhone, profession, clinicNameInput, city, about } = data

      if (!(await cityExists(city))) {
        return NextResponse.json({ error: 'Please select a valid city from the list.' }, { status: 400 })
      }

      const requiresManualReview = isGenericEmailDomain(claimerEmail)
      const otp = generateOtp()
      const claim = await prisma.claimRequest.create({
        data: {
          entityType: 'practitioner',
          isNewRegistration: true,
          newListingData: JSON.stringify({ fullName: claimerName, profession, clinicNameInput, city, about }),
          claimerName,
          claimerEmail,
          claimerPhone: claimerPhone ?? null,
          profession,
          clinicNameInput: clinicNameInput ?? null,
          requiresManualReview,
          otpCode: otp,
          otpExpiresAt: otpExpiresAt(),
          status: 'pending_otp',
        },
      })

      await sendClaimOtp({ to: claimerEmail, entityName: claimerName, otp })

      return NextResponse.json({ claimId: claim.id, entityName: claimerName, message: 'Verification code sent' })
    }

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
    if (await hasCompetingActiveClaim({ entityType: 'practitioner', entityId: practitioner.id, claimerEmail })) {
      return NextResponse.json({ error: 'A claim request for this profile is already under review' }, { status: 409 })
    }

    // Check if the email is already registered in Consentz
    const consentzUserExists = await isExistingConsentzUser(claimerEmail)
    if (consentzUserExists) {
      await prisma.claimRequest.updateMany({
        where: {
          practitionerId: practitioner.id,
          claimerEmail,
          status: 'awaiting_consentz_link',
        },
        data: { status: 'rejected' },
      })

      const token = generateLinkToken()
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
          requiresManualReview: false,
          status: 'awaiting_consentz_link',
          linkToken: token,
          linkTokenExpiresAt: linkTokenExpiresAt(),
        },
      })

      return NextResponse.json({
        consentzUserExists: true,
        claimId: claim.id,
        linkToken: token,
      })
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
