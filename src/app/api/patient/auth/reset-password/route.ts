import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { hashOtp, hashPassword, setPatientCookie } from '@/lib/patient-auth'

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const MAX_ATTEMPTS = 5

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })
    }

    const { email, otp, password } = body.data

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

    await prisma.patientOtp.update({ where: { id: record.id }, data: { used: true } })

    const passwordHash = await hashPassword(password)
    await prisma.patient.update({
      where: { id: patient.id },
      data: { passwordHash, emailVerified: true },
    })

    const res = NextResponse.json({ success: true })
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('[patient/auth/reset-password]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
