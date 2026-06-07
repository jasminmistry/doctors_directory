import type { Clinic } from "@/lib/types"

const formatSlugAsName = (slug: string): string =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const parseGooglePlaceName = (url: string | undefined): string | null => {
  if (!url) {
    return null
  }

  const match = url.match(/\/place\/([^/]+)/i)
  if (!match?.[1]) {
    return null
  }

  try {
    return decodeURIComponent(match[1].replace(/\+/g, " "))
  } catch {
    return match[1].replace(/\+/g, " ")
  }
}

export const getClinicDisplayName = (
  clinic: Pick<Clinic, "slug" | "url">
): string => {
  const fromMaps = parseGooglePlaceName(clinic.url)
  if (fromMaps && fromMaps.trim().length > 0) {
    return fromMaps.trim()
  }

  if (clinic.slug) {
    return formatSlugAsName(clinic.slug)
  }

  return "Clinic"
}
