import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'

export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const id = Number((await params).id)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const feedback = await prisma.privateFeedback.findFirst({
    where: { id, clinicId: guard.clinicId },
  })
  if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (feedback.publishedReviewId) {
    return NextResponse.json({ error: 'Already published' }, { status: 409 })
  }

  try {
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.platformReview.create({
        data: {
          clinicId: guard.clinicId,
          patientId: null,
          patientName: feedback.submitterName?.trim() || 'Verified patient',
          rating: feedback.rating,
          reviewText: feedback.comment,
          status: 'pending',
          isVerifiedPatient: false,
        },
      })
      await tx.privateFeedback.update({
        where: { id: feedback.id },
        data: { publishedReviewId: created.id, publishedAt: new Date() },
      })
      return created
    })

    return NextResponse.json({ ok: true, reviewId: review.id, status: 'pending' })
  } catch (error) {
    console.error('[portal/gbp/private-feedback/publish] failed:', error)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
