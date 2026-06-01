import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifyPassword, setPatientCookie } from '@/lib/patient-auth'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { email, password } = body.data

    const patient = await prisma.patient.findUnique({ where: { email } })

    // No account or account created via old OTP flow with no password set
    if (!patient || !patient.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, patient.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const res = NextResponse.json({ success: true })
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('[patient/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
