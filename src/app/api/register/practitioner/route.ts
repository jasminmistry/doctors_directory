import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  profession: z.string().min(2).max(255),
  clinicName: z.string().max(255).optional(),
  city: z.string().min(2).max(120),
  about: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    await prisma.pendingPractitioner.create({
      data: { submittedData: JSON.stringify(parsed.data) },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register/practitioner]', err)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
