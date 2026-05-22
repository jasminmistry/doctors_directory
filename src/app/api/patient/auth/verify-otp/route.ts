import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { hashOtp, setPatientCookie } from '@/lib/patient-auth'

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

const MAX_ATTEMPTS = 5

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Email and 6-digit code required' }, { status: 400 })
    }

    const { email, otp } = body.data

    const patient = await prisma.patient.findUnique({ where: { email } })
    if (!patient) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    const record = await prisma.patientOtp.findFirst({
      where: {
        patientId: patient.id,
        used: false,
        expiresAt: { gt: new Date() },
        attempts: { lt: MAX_ATTEMPTS },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json({ error: 'Code expired or invalid — request a new one' }, { status: 400 })
    }

    if (record.codeHash !== hashOtp(otp)) {
      await prisma.patientOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      })
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    // Mark OTP used and verify the patient's email
    await prisma.patientOtp.update({ where: { id: record.id }, data: { used: true } })
    await prisma.patient.update({ where: { id: patient.id }, data: { emailVerified: true } })

    // Backfill patientId on existing sessions/bookings/leads linked by email
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

    const res = NextResponse.json({ success: true })
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('[patient/auth/verify-otp]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
