import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const items = await prisma.privateFeedback.findMany({
    where: { clinicId: guard.clinicId },
    orderBy: { submittedAt: 'desc' },
    take: 500,
    select: {
      id: true,
      rating: true,
      comment: true,
      submitterName: true,
      submittedAt: true,
      googlePromptShownAt: true,
      googleReviewClickedAt: true,
      publishedReviewId: true,
      publishedAt: true,
    },
  })

  const count = items.length
  const average = count ? items.reduce((s, i) => s + i.rating, 0) / count : 0
  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: items.filter((i) => i.rating === star).length,
  }))
  const googleClicks = items.filter((i) => i.googleReviewClickedAt).length

  return NextResponse.json({
    items,
    stats: { count, average: Math.round(average * 10) / 10, distribution, googleClicks },
  })
}
