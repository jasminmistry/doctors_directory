import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  clinicName: z.string().min(2).max(255),
  contactName: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(6).max(50),
  address: z.string().min(2).max(500),
  city: z.string().min(2).max(120),
  website: z.string().url().max(500).optional().or(z.literal('')),
  category: z.string().max(100).optional(),
  about: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    await prisma.pendingClinic.create({
      data: { submittedData: JSON.stringify(parsed.data) },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register/clinic]', err)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
