import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { hashPassword, setPatientCookie } from '@/lib/patient-auth'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })
    }

    const { email, password, firstName, lastName } = body.data

    const existing = await prisma.patient.findUnique({ where: { email } })
    if (existing?.passwordHash) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const patient = await prisma.patient.upsert({
      where: { email },
      create: { email, passwordHash, emailVerified: true, firstName, lastName },
      update: { passwordHash, emailVerified: true, ...(firstName && { firstName }), ...(lastName && { lastName }) },
    })

    await Promise.all([
      prisma.chatSession.updateMany({
        where: { patientEmail: email, patientId: null },
        data: { patientId: patient.id },
      }),
      prisma.booking.updateMany({
        where: { patientEmail: email, patientId: null },
        data: { patientId: patient.id },
      }),
      prisma.consultationLead.updateMany({
        where: { patientEmail: email, patientId: null },
        data: { patientId: patient.id },
      }),
    ])

    const res = NextResponse.json({ success: true, isNewUser: true })
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('[patient/auth/register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
