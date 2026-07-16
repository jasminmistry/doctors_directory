/** Ganesh SEO: noindex/nofollow on all practitioner directory surfaces. */
export const PRACTITIONER_PAGES_NOINDEX = true

/** @deprecated Prefer PRACTITIONER_PAGES_NOINDEX — kept for call sites. */
export const PRACTITIONER_PROFILES_NOINDEX = PRACTITIONER_PAGES_NOINDEX

export type PractitionerRobots = { index: false; follow: false }

export function getPractitionerDirectoryRobots(): PractitionerRobots | undefined {
  if (!PRACTITIONER_PAGES_NOINDEX) return undefined
  return { index: false, follow: false }
}

/** Alias for profile pages; same policy as the rest of the practitioner directory. */
export function getPractitionerProfileRobots(): PractitionerRobots | undefined {
  return getPractitionerDirectoryRobots()
}
