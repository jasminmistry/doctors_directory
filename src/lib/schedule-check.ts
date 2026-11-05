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

const DOW_MAP: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday',
}

/**
 * Whether today is an enabled booking day per the portal schedule — same priority
 * as formatPortalScheduleForDisplay (the booking schedule wins over legacy ClinicHour
 * when configured). Returns null when no schedule is configured, so the caller can
 * fall back to ClinicHour; this mirrors the "is clinic open" check the public profile's
 * online-status indicator relies on, not just display formatting.
 */
export function isTodayEnabledInPortalSchedule(scheduleJson: string | null | undefined): boolean | null {
  if (!scheduleJson) return null

  let schedule: PortalDaySchedule[]
  try {
    schedule = JSON.parse(scheduleJson)
  } catch {
    return null
  }
  if (!Array.isArray(schedule) || schedule.length === 0) return null

  const today = DOW_MAP[new Date().getDay()]
  const entry = schedule.find((e) => e.day === today)
  return entry?.enabled ?? false
}
