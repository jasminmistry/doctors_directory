import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  clinicSlug: z.string().trim().min(1),
  patientName: z.string().trim().min(1, 'Your name is required.').max(200),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().trim().min(10, 'Please write at least 10 characters.').max(2000),
  treatment: z.string().trim().max(255).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { clinicSlug, patientName, rating, reviewText, treatment } = parsed.data

    const clinic = await prisma.clinic.findUnique({
      where: { slug: clinicSlug },
      select: { id: true },
    })
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

    await prisma.platformReview.create({
      data: { clinicId: clinic.id, patientName, rating, reviewText, treatment },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[reviews] submit error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
