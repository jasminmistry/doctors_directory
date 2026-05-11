import { getClinics } from "@/lib/sitemap-data"
import { toUrlSlug } from "@/lib/utils"

export * from "./scaled-pages-shared"

export function getDirectoryTreatmentBases(minCount = 5, maxItems = 80) {
  const counts = new Map<string, { label: string; count: number }>()
  for (const clinic of getClinics()) {
    for (const treatment of clinic.Treatments ?? []) {
      const label = treatment.trim()
      if (!label) continue
      const slug = toUrlSlug(label)
      const prev = counts.get(slug)
      if (prev) {
        prev.count += 1
      } else {
        counts.set(slug, { label, count: 1 })
      }
    }
  }
  return [...counts.entries()]
    .filter(([, v]) => v.count >= minCount)
    .sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label))
    .slice(0, maxItems)
    .map(([slug, v]) => ({ slug, label: v.label, count: v.count }))
}
