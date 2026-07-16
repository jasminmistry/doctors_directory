const MIN_AGE = 18

/** Latest date of birth that satisfies the minimum-age requirement, for use as an `<input type="date" max>`. */
export function maxDobDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - MIN_AGE)
  return d.toISOString().slice(0, 10)
}

/** Returns a user-facing error message if `dob` (YYYY-MM-DD) is missing, malformed, in the future, or under 18 — otherwise null. */
export function getDobValidationError(dob: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return 'Please enter a valid date of birth.'

  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return 'Please enter a valid date of birth.'
  if (birth > new Date()) return 'Please enter a valid date of birth.'

  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE)
  if (birth > cutoff) return 'You must be 18 or over to request consultations.'

  return null
}
