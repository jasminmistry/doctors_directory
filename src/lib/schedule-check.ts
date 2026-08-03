import { prisma } from '@/lib/db'

/**
 * Returns true if an approved claim for this clinic has a confirmed schedule.
 * Used to gate booking and call routes before hitting Core API.
 */
export async function isClinicScheduleConfigured(clinicId: number): Promise<boolean> {
  const claim = await prisma.claimRequest.findFirst({
    where: { clinicId, status: 'approved', scheduleConfigured: true },
    select: { id: true },
  })
  return claim !== null
}

export const SCHEDULE_NOT_CONFIGURED_RESPONSE = {
  error: 'Bookings are not available yet — the clinic has not configured their schedule.',
  code: 'SCHEDULE_NOT_CONFIGURED',
} as const

interface PortalDaySchedule {
  day: string
  startTime: string
  endTime: string
  enabled: boolean
}

const DISPLAY_DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Converts ClaimRequest.scheduleJson into { day: "HH:MM - HH:MM" | "Closed" } for the patient-facing Hours section.
export function formatPortalScheduleForDisplay(scheduleJson: string | null | undefined): Record<string, string> | null {
  if (!scheduleJson) return null

  let schedule: PortalDaySchedule[]
  try {
    schedule = JSON.parse(scheduleJson)
  } catch {
    return null
  }
  if (!Array.isArray(schedule) || schedule.length === 0) return null

  const byDay = new Map(schedule.map((entry) => [entry.day, entry]))
  const result: Record<string, string> = {}
  for (const day of DISPLAY_DAY_ORDER) {
    const entry = byDay.get(day)
    result[day] = entry?.enabled ? `${entry.startTime} - ${entry.endTime}` : 'Closed'
  }
  return result
}
