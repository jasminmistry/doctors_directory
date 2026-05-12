import { consentzApi, getConsentzAuthUrl } from '@/lib/auth'

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
  }
}

export async function getCoreAvailability(
  coreClinicId: number,
  date: string,
  sessionToken?: string,
): Promise<CoreAvailabilityResponse> {
  const res = await consentzApi(
    `/api/core-lite/clinics/${coreClinicId}/availability?date=${date}`,
    { sessionToken },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error((err as { message?: string }).message ?? 'Core availability error'), { status: res.status })
  }
  return res.json()
}

export async function createCoreBooking(
  coreClinicId: number,
  payload: CoreBookingPayload,
  sessionToken?: string,
): Promise<CoreBookingResponse> {
  const res = await consentzApi(`/api/core-lite/clinics/${coreClinicId}/bookings`, {
    method: 'POST',
    body: payload,
    sessionToken,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error((err as { message?: string }).message ?? 'Core booking error'), { status: res.status })
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
