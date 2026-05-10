import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { action, adminNotes } = parsed.data

    const vr = await prisma.verificationRequest.findUnique({ where: { id } })
    if (!vr) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    if (vr.status !== 'pending') {
      return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 })
    }

    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes: adminNotes ?? null,
        reviewedAt: new Date(),
      },
    })

    if (action === 'approve') {
      if (vr.entityType === 'clinic') {
        await prisma.clinic.updateMany({
          where: { slug: vr.entitySlug },
          data: { idVerified: true, manualVerified: true },
        })
      } else {
        await prisma.practitioner.updateMany({
          where: { slug: vr.entitySlug },
          data: { idVerified: true, manualVerified: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin verification review error:', error)
    return NextResponse.json({ error: 'Failed to update verification request' }, { status: 500 })
  }
}
