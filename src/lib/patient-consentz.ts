import crypto from 'crypto'
import { prisma } from '@/lib/db'
import type { Patient } from '@prisma/client'

function getConsentzBase(): string {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL not configured')
  return new URL(authUrl).origin
}

interface ConsentzTokenResponse {
  sessionToken: string
  sessionExpiredAt: string
  refreshToken: string
  refreshTokenExpiredAt: string
}

async function loginConsentzPatient(email: string, password: string): Promise<ConsentzTokenResponse> {
  const res = await fetch(`${getConsentzBase()}/api/v1/login`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-ID': 'iphone',
      'X-INSTALLATION-ID': `patient-${Buffer.from(email).toString('base64url')}`,
    },
    body: JSON.stringify({ username: email, password }),
  })
  if (!res.ok) {
    const err = new Error(`Consentz patient login failed: ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res.json() as Promise<ConsentzTokenResponse>
}

async function refreshConsentzPatientToken(refreshToken: string): Promise<ConsentzTokenResponse> {
  const res = await fetch(`${getConsentzBase()}/api/v1/refresh-token`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-ID': 'iphone',
    },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) {
    const err = new Error(`Consentz token refresh failed: ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res.json() as Promise<ConsentzTokenResponse>
}

async function storeTokens(patientId: number, tokens: ConsentzTokenResponse) {
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      consentzSessionToken: tokens.sessionToken,
      consentzRefreshToken: tokens.refreshToken,
      consentzSessionExpiresAt: new Date(tokens.sessionExpiredAt),
      consentzRefreshExpiresAt: new Date(tokens.refreshTokenExpiredAt),
    },
  })
}

export function generateConsentzPassword(): string {
  return crypto.randomBytes(24).toString('base64url')
}

/**
 * Returns a valid Consentz session token for the patient, refreshing or re-logging in as needed.
 * Returns null if the patient has no Consentz account yet (consentzPassword not set).
 */
export async function getConsentzToken(patient: Patient): Promise<string | null> {
  if (!patient.consentzPassword) return null

  const now = new Date()

  if (patient.consentzSessionToken && patient.consentzSessionExpiresAt && patient.consentzSessionExpiresAt > now) {
    return patient.consentzSessionToken
  }

  if (patient.consentzRefreshToken && patient.consentzRefreshExpiresAt && patient.consentzRefreshExpiresAt > now) {
    try {
      const tokens = await refreshConsentzPatientToken(patient.consentzRefreshToken)
      await storeTokens(patient.id, tokens)
      return tokens.sessionToken
    } catch {
      // fall through to re-login
    }
  }

  try {
    const tokens = await loginConsentzPatient(patient.email, patient.consentzPassword)
    await storeTokens(patient.id, tokens)
    return tokens.sessionToken
  } catch {
    return null
  }
}

/**
 * Called after a successful first booking to store credentials and acquire an initial session token.
 * Consentz must support a `patient_password` field on booking creation to set up the account.
 */
export async function initConsentzPatient(patientId: number, email: string, password: string): Promise<string | null> {
  try {
    const tokens = await loginConsentzPatient(email, password)
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        consentzPassword: password,
        consentzSessionToken: tokens.sessionToken,
        consentzRefreshToken: tokens.refreshToken,
        consentzSessionExpiresAt: new Date(tokens.sessionExpiredAt),
        consentzRefreshExpiresAt: new Date(tokens.refreshTokenExpiredAt),
      },
    })
    return tokens.sessionToken
  } catch {
    // Store password even if login fails — will retry on next booking
    await prisma.patient.update({
      where: { id: patientId },
      data: { consentzPassword: password },
    })
    return null
  }
}

export interface ConsentzBooking {
  id: number | string
  clinicName: string
  practitionerName: string
  treatment: string | null
  slotStart: string
  slotEnd: string
  status: string
  bookingType: 'in_person' | 'video'
  videoCall: { joinUrl: string | null; joinUrlReady: boolean } | null
}

export async function fetchConsentzBookings(sessionToken: string): Promise<ConsentzBooking[]> {
  const res = await fetch(`${getConsentzBase()}/api/patients/me/bookings`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${sessionToken}` },
  })
  if (!res.ok) {
    const err = new Error(`Consentz bookings fetch failed: ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  const data = await res.json() as { bookings: ConsentzBooking[] }
  return data.bookings
}

export async function fetchConsentzBooking(sessionToken: string, id: string | number): Promise<ConsentzBooking> {
  const res = await fetch(`${getConsentzBase()}/api/patients/me/bookings/${id}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${sessionToken}` },
  })
  if (!res.ok) {
    const err = new Error(`Consentz booking fetch failed: ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res.json() as Promise<ConsentzBooking>
}

export async function cancelConsentzBooking(sessionToken: string, id: string | number): Promise<void> {
  const res = await fetch(`${getConsentzBase()}/api/patients/me/bookings/${id}`, {
    method: 'PATCH',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    const err = new Error(body.error ?? `Cancel failed: ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
}
