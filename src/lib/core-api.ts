import { getConsentzAuthUrl } from '@/lib/auth'

function getCoreLiteBase(): string {
  return `${new URL(getConsentzAuthUrl()).origin}/api/core-lite`
}

function coreLiteApi(
  path: string,
  options: { method?: string; body?: unknown; sessionToken?: string } = {},
): Promise<Response> {
  const { method = 'GET', body, sessionToken } = options
  return fetch(`${getCoreLiteBase()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { 'X-SESSION-TOKEN': sessionToken } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

export interface CoreSlot {
  time: string
  time_12h: string
  datetime: string
  practitioner_id: number
  practitioner: string
}

export interface CoreAvailabilityResponse {
  available: CoreSlot[]
  date: string
  timezone: string
  slot_duration: number
  clinic_id: number
}

export interface CoreBookingPayload {
  practitioner_id: number
  treatment_id?: number
  slot_start: string
  slot_end: string
  patient_first_name: string
  patient_last_name: string
  patient_email: string
  patient_phone: string
  video_call?: boolean
}

export interface CoreBookingResponse {
  booking: {
    id: number
    status: string
    slot_start: string
    slot_end: string
    practitioner: { id: number; name: string }
    treatment: { id: number; name: string } | null
    patient: { id: number; name: string; email: string }
    video_call: { type: 'zoom' | 'jitsi'; join_url: string; start_url: string } | null
  }
}

export async function getCoreAvailability(
  coreClinicId: number,
  date: string,
  sessionToken?: string,
): Promise<CoreAvailabilityResponse> {
  const path = `/clinics/${coreClinicId}/availability?date=${date}`
  console.log(`[core-api/availability] GET ${getCoreLiteBase()}${path}`)
  const res = await coreLiteApi(path, { sessionToken })
  console.log(`[core-api/availability] HTTP ${res.status}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[core-api/availability] error body: ${body}`)
    let err: { message?: string } = {}
    try { err = JSON.parse(body) } catch { /* raw */ }
    throw Object.assign(new Error(err.message ?? 'Core availability error'), { status: res.status })
  }
  return res.json()
}

export async function createCoreBooking(
  coreClinicId: number,
  payload: CoreBookingPayload,
  sessionToken?: string,
): Promise<CoreBookingResponse> {
  const res = await coreLiteApi(`/clinics/${coreClinicId}/bookings`, {
    method: 'POST',
    body: payload,
    sessionToken,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let errMsg = 'Core booking error'
    try { errMsg = (JSON.parse(body) as { message?: string }).message ?? errMsg } catch { /* raw */ }
    console.error(`[core-api] createCoreBooking failed: HTTP ${res.status} — ${body}`)
    throw Object.assign(new Error(errMsg), { status: res.status, body })
  }
  return res.json()
}

export function isCoreConfigured(): boolean {
  try {
    getConsentzAuthUrl()
    return true
  } catch {
    return false
  }
}
