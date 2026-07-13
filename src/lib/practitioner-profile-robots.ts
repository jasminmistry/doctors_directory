export const PRACTITIONER_PROFILES_NOINDEX = true

export function getPractitionerProfileRobots():
  | { index: false; follow: false }
  | undefined {
  if (!PRACTITIONER_PROFILES_NOINDEX) return undefined
  return { index: false, follow: false }
}
