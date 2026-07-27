export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'

const bodySchema = z.object({
  clinicSlug: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const body = bodySchema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { slug: body.data.clinicSlug },
    select: { id: true, claimed: true },
  })
  if (!clinic?.claimed) {
    return NextResponse.json({ error: 'Clinic not available for chat' }, { status: 400 })
  }

  // Reuse an existing conversation with this clinic rather than spawning a new one every time
  const existing = await prisma.chatSession.findFirst({
    where: { patientId: patient.id, clinicId: clinic.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ sessionId: existing.id })
  }

  const patientName = `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || patient.email

  const session = await prisma.chatSession.create({
    data: {
      clinicId: clinic.id,
      patientId: patient.id,
      visitorToken: crypto.randomBytes(32).toString('hex'),
      patientName,
      patientEmail: patient.email,
      patientPhone: patient.phone ?? undefined,
    },
  })

  return NextResponse.json({ sessionId: session.id })
}
