import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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

const bulkSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete']),
  ids: z.array(z.number().int()).min(1),
  isVerifiedPatient: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const parsed = bulkSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { action, ids, isVerifiedPatient } = parsed.data
  const now = new Date()

  try {
    if (action === 'delete') {
      await prisma.platformReview.deleteMany({ where: { id: { in: ids } } })
      return NextResponse.json({ affected: ids.length })
    }

    const data = {
      status: action === 'approve' ? ('approved' as const) : ('rejected' as const),
      ...(action === 'approve' ? { approvedAt: now } : { rejectedAt: now }),
      ...(action === 'approve' && isVerifiedPatient !== undefined ? { isVerifiedPatient } : {}),
    }
    const result = await prisma.platformReview.updateMany({ where: { id: { in: ids } }, data })
    return NextResponse.json({ affected: result.count })
  } catch (err) {
    console.error('[admin/reviews] bulk error:', err)
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
  }
}
