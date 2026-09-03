import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getClientIp } from '@/lib/geo-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import { feedbackSubmitSchema } from '@/lib/schemas/feedback.schema'
import { hashReviewToken, verifyDwellToken, hashIp } from '@/lib/reviews'
import { buildGoogleReviewUrl } from '@/lib/gbp/place-id'

export const dynamic = 'force-dynamic'

// Silent-success payload — used for honeypot / dwell drops so bots get no signal.
const SILENT_OK = NextResponse.json({ ok: true, googleReviewUrl: null })

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const tokenHash = hashReviewToken(token)

  const ip = getClientIp(req.headers) ?? 'unknown'
  const ipHash = hashIp(ip)

  const [ipLimit, tokenLimit] = await Promise.all([
    checkRateLimit(`fb:ip:${ipHash}`, 5, 60 * 60),
    checkRateLimit(`fb:token:${tokenHash}`, 3, 60 * 60 * 24 * 90),
  ])
  if (!ipLimit.ok || !tokenLimit.ok) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = feedbackSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const data = parsed.data

  // Honeypot: real users never fill this hidden field.
  if (data.company && data.company.trim() !== '') return SILENT_OK
  // Dwell time: submitted too fast (bot) or too late (stale/replayed).
  if (!data.dwell || !verifyDwellToken(data.dwell)) return SILENT_OK

  const reviewRequest = await prisma.reviewRequest.findUnique({
    where: { tokenHash },
    include: {
      clinic: {
        select: {
          id: true,
          placeId: true,
          gmapsUrl: true,
          gbpConnection: { select: { newReviewUri: true, placeId: true } },
        },
      },
    },
  })

  if (!reviewRequest) {
    return NextResponse.json({ error: 'This link is not valid.' }, { status: 404 })
  }
  if (reviewRequest.usedAt) {
    return NextResponse.json({ error: 'This link has already been used.' }, { status: 410 })
  }
  if (reviewRequest.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'This link has expired.' }, { status: 410 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.privateFeedback.create({
        data: {
          clinicId: reviewRequest.clinicId,
          reviewRequestId: reviewRequest.id,
          rating: data.rating,
          comment: data.comment.trim(),
          submitterName: data.submitterName?.trim() || reviewRequest.patientName || null,
          ipHash,
          googlePromptShownAt: new Date(),
        },
      })
      await tx.reviewRequest.update({ where: { id: reviewRequest.id }, data: { usedAt: new Date() } })
    })
  } catch (error) {
    // Unique constraint on reviewRequestId → a race double-submit; treat as done.
    if ((error as { code?: string }).code !== 'P2002') {
      console.error('[feedback] submit failed:', error)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }
  }

  const googleReviewUrl = buildGoogleReviewUrl({
    newReviewUri: reviewRequest.clinic.gbpConnection?.newReviewUri ?? null,
    clinic: {
      placeId: reviewRequest.clinic.placeId ?? reviewRequest.clinic.gbpConnection?.placeId ?? null,
      gmapsUrl: reviewRequest.clinic.gmapsUrl,
    },
  })

  return NextResponse.json({ ok: true, googleReviewUrl })
}
