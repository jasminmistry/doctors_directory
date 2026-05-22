import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { COOKIE_OPTS } from '@/lib/auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Patient } from '@prisma/client'

export const PATIENT_COOKIE = 'patient_session'
const SECRET = process.env.PATIENT_SESSION_SECRET ?? 'patient-dev-secret-change-in-prod'

interface PatientClaims {
  id: number
  email: string
}

function sign(payload: PatientClaims): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verify(token: string): PatientClaims | null {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  try {
    if (sig.length !== expected.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString()) as PatientClaims
  } catch {
    return null
  }
}

export function getPatientClaims(req: NextRequest): PatientClaims | null {
  const raw = req.cookies.get(PATIENT_COOKIE)?.value
  if (!raw) return null
  return verify(raw)
}

export async function requirePatient(
  req: NextRequest,
): Promise<{ patient: Patient; error: null } | { patient: null; error: NextResponse }> {
  const claims = getPatientClaims(req)
  if (!claims) {
    return { patient: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const patient = await prisma.patient.findUnique({ where: { id: claims.id } })
  if (!patient) {
    return { patient: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { patient, error: null }
}

export function setPatientCookie(res: NextResponse, patient: PatientClaims) {
  res.cookies.set(PATIENT_COOKIE, sign(patient), {
    ...COOKIE_OPTS,
    maxAge: 30 * 24 * 60 * 60,
  })
}

export function clearPatientCookie(res: NextResponse) {
  res.cookies.set(PATIENT_COOKIE, '', { ...COOKIE_OPTS, maxAge: 0 })
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999))
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}
