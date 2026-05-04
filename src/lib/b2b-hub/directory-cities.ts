import { getClinics } from "@/lib/sitemap-data"
import { toUrlSlug } from "@/lib/utils"

export function getUniqueDirectoryCityNames(): string[] {
  const seen = new Set<string>()
  for (const clinic of getClinics()) {
    const name = clinic.City?.trim()
    if (name) seen.add(name)
  }
  return [...seen].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  )
}

export function directoryCityNameToSlug(name: string): string {
  return toUrlSlug(name.trim())
}
