// Collapses structured ClinicHourPeriod rows into the legacy ClinicHour free-text rows
// ("09:00–17:30", "09:00–12:00, 13:00–17:00", "Closed") so the public profile hours
// renderer, which reads ClinicHour, keeps working unchanged.

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export interface HourPeriodInput {
  openDay: DayOfWeek
  openTime: string // "HH:MM"
  closeDay: DayOfWeek
  closeTime: string // "HH:MM"
  sortOrder?: number
}

/** Returns a full 7-entry map of day -> display string, "Closed" where no period exists. */
export function periodsToDisplayMap(periods: HourPeriodInput[]): Record<DayOfWeek, string> {
  const byDay: Record<DayOfWeek, string[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }

  for (const p of [...periods].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.openTime.localeCompare(b.openTime))) {
    // Periods are anchored on their open day. Overnight periods (close day differs) still
    // render on the open day; GBP's own UI does the same.
    byDay[p.openDay].push(`${p.openTime}–${p.closeTime}`)
  }

  const out = {} as Record<DayOfWeek, string>
  for (const day of DAYS_OF_WEEK) {
    out[day] = byDay[day].length ? byDay[day].join(', ') : 'Closed'
  }
  return out
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidHHMM(value: string): boolean {
  return HHMM.test(value)
}

/** GBP regularHours period shape: { openDay, openTime: {hours,minutes}, closeDay, closeTime }. */
export function periodToGbp(p: HourPeriodInput) {
  const [oh, om] = p.openTime.split(':').map(Number)
  const [ch, cm] = p.closeTime.split(':').map(Number)
  return {
    openDay: p.openDay.toUpperCase(),
    openTime: { hours: oh, minutes: om },
    closeDay: p.closeDay.toUpperCase(),
    closeTime: { hours: ch, minutes: cm },
  }
}
