import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  action: z.enum(['approve', 'reject']),
  isVerifiedPatient: z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { action, isVerifiedPatient } = parsed.data
  const now = new Date()

  try {
    const review = await prisma.platformReview.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        ...(action === 'approve' ? { approvedAt: now } : { rejectedAt: now }),
        ...(isVerifiedPatient !== undefined ? { isVerifiedPatient } : {}),
      },
    })
    return NextResponse.json({ review })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    console.error('[admin/reviews] update error:', err)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
