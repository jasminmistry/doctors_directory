import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateOtp, hashOtp } from '@/lib/patient-auth'
import { sendPasswordResetOtp } from '@/lib/email'

const bodySchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { email } = body.data

    const patient = await prisma.patient.findUnique({ where: { email } })
    // Always return success to avoid email enumeration
    if (!patient) return NextResponse.json({ sent: true })

    await prisma.patientOtp.updateMany({
      where: { patientId: patient.id, used: false },
      data: { used: true },
    })

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.patientOtp.create({
      data: { patientId: patient.id, codeHash: hashOtp(otp), expiresAt },
    })

    await sendPasswordResetOtp({ to: email, otp })

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[patient/auth/forgot-password]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
