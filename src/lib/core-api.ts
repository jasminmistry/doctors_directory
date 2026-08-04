import crypto from 'crypto'
import { getConsentzAuthUrl, getApplicationId } from '@/lib/auth'

function getCoreLiteBase(): string {
  return `${new URL(getConsentzAuthUrl()).origin}/api/core-lite`
}

async function coreLiteApi(
  path: string,
  options: { method?: string; body?: unknown; sessionToken?: string } = {},
): Promise<Response> {
  const { method = 'GET', body, sessionToken } = options
  const url = `${getCoreLiteBase()}${path}`
  const appId = getApplicationId()
  console.log(`[core-lite] ${method} ${url}  appId=${appId} hasToken=${!!sessionToken}`)
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-ID': appId,
      ...(sessionToken ? { 'X-SESSION-TOKEN': sessionToken } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const clone = res.clone()
    const errBody = await clone.text().catch(() => '')
    console.error(`[core-lite] ${method} ${url} → HTTP ${res.status}  body=${errBody}`)
  } else {
    console.log(`[core-lite] ${method} ${url} → HTTP ${res.status}`)
  }
  return res
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

export interface CoreClinicProfile {
  id: number
  name: string | null
  timezone: string | null
}

export async function getCoreClinicProfile(
  coreClinicId: number,
  sessionToken?: string,
): Promise<CoreClinicProfile> {
  const res = await coreLiteApi(`/clinics/${coreClinicId}`, { sessionToken })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw Object.assign(new Error('Core clinic profile error'), { status: res.status, body })
  }
  return res.json()
}

/** Rejects booking creation for a slot that has already started — display-side filtering can't be trusted alone (stale page, direct API calls, slow form-fill). */
export function isSlotInPast(slotStart: Date): boolean {
  return slotStart.getTime() <= Date.now()
}

const DEFAULT_CLINIC_TIMEZONE = 'Europe/London'

/** Resolves a clinic's IANA timezone from Core, falling back to Europe/London if unset/unreachable. */
export async function resolveClinicTimezone(coreClinicId: number | null): Promise<string> {
  if (!coreClinicId) return DEFAULT_CLINIC_TIMEZONE
  try {
    const profile = await getCoreClinicProfile(coreClinicId)
    return profile.timezone || DEFAULT_CLINIC_TIMEZONE
  } catch {
    return DEFAULT_CLINIC_TIMEZONE
  }
}

export interface CoreScheduleDay {
  day: string
  startTime: string | null
  endTime: string | null
  enabled: boolean
}

/**
 * Weekly schedule reads/writes go through /api/core-lite/directory/schedule, not the
 * v1 practitioner endpoint — that one requires X-SESSION-TOKEN, which an SSO-linked
 * portal session may not have (device-less ConsentzLive web logins mint no session
 * token; see admin_directory_sso). The core-lite route is scoped by consentzUserId
 * instead, with writes proven server-to-server via DIRECTORY_LINK_SECRET HMAC.
 */
export async function getCoreSchedule(consentzUserId: number): Promise<CoreScheduleDay[]> {
  const res = await coreLiteApi(`/directory/schedule?consentzUserId=${consentzUserId}`)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data.schedule) ? data.schedule : []
}

export async function setCoreSchedule(
  consentzUserId: number,
  schedule: CoreScheduleDay[],
): Promise<CoreScheduleDay[]> {
  const secret = process.env.DIRECTORY_LINK_SECRET
  if (!secret) throw new Error('DIRECTORY_LINK_SECRET is not configured')

  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${consentzUserId}:${JSON.stringify(schedule)}`)
    .digest('hex')

  const res = await coreLiteApi('/directory/schedule', {
    method: 'POST',
    body: { consentzUserId, schedule, sig },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw Object.assign(new Error('Failed to save schedule to Core'), { status: res.status, body })
  }
  const data = await res.json()
  return Array.isArray(data.schedule) ? data.schedule : []
}

export interface CorePullLeadContact {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  countryCode: string | null
  notes: string | null
}

export interface CorePullLeadResponse {
  leadCaptureId: number
  coreUrl: string
}

/**
 * Creates a LeadCapture prospect in Core from a directory ConsultationLead, called when a
 * clinic admin clicks "Pull into Consentz Core" on a lead. Signed the same way as
 * setCoreSchedule() above — Core verifies via DIRECTORY_LINK_SECRET HMAC.
 * Key order in `contact` must match Core's DirectoryController::prospectPull() exactly,
 * since the signature is computed over its JSON-encoded form.
 */
export async function pullLeadToCore(
  consentzClinicId: number,
  directoryLeadId: number,
  contact: CorePullLeadContact,
): Promise<CorePullLeadResponse> {
  const secret = process.env.DIRECTORY_LINK_SECRET
  if (!secret) throw new Error('DIRECTORY_LINK_SECRET is not configured')

  const orderedContact = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    countryCode: contact.countryCode,
    notes: contact.notes,
  }

  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${consentzClinicId}:${directoryLeadId}:${JSON.stringify(orderedContact)}`)
    .digest('hex')

  const res = await coreLiteApi('/directory/prospect-pull', {
    method: 'POST',
    body: { consentzClinicId, directoryLeadId, ...orderedContact, sig },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let errMsg = 'Failed to pull lead into Core'
    try { errMsg = (JSON.parse(body) as { message?: string }).message ?? errMsg } catch { /* raw */ }
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
