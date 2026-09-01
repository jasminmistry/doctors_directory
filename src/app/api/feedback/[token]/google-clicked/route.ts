import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashReviewToken } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

// Best-effort attribution: the public "Leave a Google review" button pings this on click.
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  try {
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { tokenHash: hashReviewToken(token) },
      select: { feedback: { select: { id: true, googleReviewClickedAt: true } } },
    })
    if (reviewRequest?.feedback && !reviewRequest.feedback.googleReviewClickedAt) {
      await prisma.privateFeedback.update({
        where: { id: reviewRequest.feedback.id },
        data: { googleReviewClickedAt: new Date() },
      })
    }
  } catch (err) {
    console.error('[feedback/google-clicked] failed:', err)
  }
  return NextResponse.json({ ok: true })
}
