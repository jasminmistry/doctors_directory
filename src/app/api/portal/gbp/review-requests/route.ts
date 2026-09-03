import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { reviewRequestCreateSchema } from '@/lib/schemas/feedback.schema'
import { generateReviewToken, reviewRequestExpiry } from '@/lib/reviews'
import { getClinicDisplayName } from '@/lib/clinic-display'
import { sendReviewRequestEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function GET() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const requests = await prisma.reviewRequest.findMany({
    where: { clinicId: guard.clinicId },
    orderBy: { issuedAt: 'desc' },
    take: 200,
    select: {
      id: true,
      patientName: true,
      patientEmail: true,
      channel: true,
      issuedAt: true,
      emailSentAt: true,
      expiresAt: true,
      usedAt: true,
      feedback: { select: { id: true, rating: true, submittedAt: true } },
    },
  })

  return NextResponse.json({ requests })
}

export async function POST(request: Request) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = reviewRequestCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const { patientName, sendEmail } = parsed.data
  const patientEmail = parsed.data.patientEmail?.trim() || null

  if (sendEmail && !patientEmail) {
    return NextResponse.json({ error: 'An email address is required to send the request' }, { status: 400 })
  }

  const { rawToken, tokenHash } = generateReviewToken()

  const reviewRequest = await prisma.reviewRequest.create({
    data: {
      clinicId: guard.clinicId,
      tokenHash,
      patientName: patientName?.trim() || null,
      patientEmail,
      channel: sendEmail ? 'email' : 'link',
      createdByClaimId: guard.claimId,
      expiresAt: reviewRequestExpiry(),
    },
  })

  const feedbackUrl = `${BASE_URL}/directory/feedback/${rawToken}`

  if (sendEmail && patientEmail) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: guard.clinicId },
      select: { name: true, slug: true, gmapsUrl: true },
    })
    const clinicName =
      clinic?.name ||
      getClinicDisplayName({ slug: clinic?.slug ?? '', url: clinic?.gmapsUrl ?? undefined })
    try {
      await sendReviewRequestEmail({ to: patientEmail, clinicName, feedbackUrl })
      await prisma.reviewRequest.update({ where: { id: reviewRequest.id }, data: { emailSentAt: new Date() } })
    } catch (err) {
      console.error('[portal/gbp/review-requests] email send failed:', err)
      return NextResponse.json({ id: reviewRequest.id, feedbackUrl, emailSent: false }, { status: 201 })
    }
  }

  return NextResponse.json({ id: reviewRequest.id, feedbackUrl, emailSent: !!sendEmail }, { status: 201 })
}
