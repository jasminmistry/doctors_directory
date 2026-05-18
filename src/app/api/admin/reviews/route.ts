import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? 'pending'

  const reviews = await prisma.platformReview.findMany({
    where: status === 'all' ? {} : { status: status as 'pending' | 'approved' | 'rejected' },
    include: { clinic: { select: { slug: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ reviews })
}
