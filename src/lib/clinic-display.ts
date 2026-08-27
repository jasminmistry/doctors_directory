import type { Clinic } from "@/lib/types"

const formatSlugAsName = (slug: string): string => {
  const withDrPrefix = slug.replace(/^(dr)(?=[a-z])/i, "$1-")
  return withDrPrefix
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^(bmi|dhi|sc|np|uk|ltd)$/i.test(part)) {
        return part.toUpperCase()
      }
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")
}

const parseGooglePlaceName = (url: string | undefined): string | null => {
  if (!url) {
    return null
  }

  const placeMatch = url.match(/\/place\/([^/]+)/i)
  if (placeMatch?.[1]) {
    try {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " "))
    } catch {
      return placeMatch[1].replace(/\+/g, " ")
    }
  }

  return null
}

/** Prefer an explicit name when it looks human-readable (not a handle/slug). */
const isUsableDisplayName = (name: string, slug: string | undefined): boolean => {
  const trimmed = name.trim()
  if (!trimmed) return false

  const slugLower = slug?.toLowerCase()
  const nameLower = trimmed.toLowerCase()
  if (slugLower && (nameLower === slugLower || nameLower === slugLower.replace(/-/g, ""))) {
    return false
  }

  // Reject all-lowercase single tokens (instagram-style handles)
  if (!/\s/.test(trimmed) && trimmed === nameLower) {
    return false
  }

  return true
}

export const getClinicDisplayName = (
  clinic: Pick<Clinic, "slug" | "url"> & { name?: string | null }
): string => {
  const explicit = clinic.name?.trim()
  if (explicit && isUsableDisplayName(explicit, clinic.slug)) {
    return explicit
  }

  const fromMaps = parseGooglePlaceName(clinic.url)
  if (fromMaps && fromMaps.trim().length > 0) {
    return fromMaps.trim()
  }

  if (clinic.slug) {
    return formatSlugAsName(clinic.slug)
  }

  return "Clinic"
}
