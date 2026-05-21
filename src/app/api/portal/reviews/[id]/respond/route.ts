export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

const schema = z.object({
  response: z.string().min(1).max(2000),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getPortalUser()
  if (!user?.clinicId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const review = await prisma.platformReview.update({
      where: { id, clinicId: user.clinicId, status: 'approved' },
      data: { clinicResponse: parsed.data.response, respondedAt: new Date() },
    })
    return NextResponse.json({ review })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    console.error('[portal/reviews/respond] error:', err)
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
  }
}
