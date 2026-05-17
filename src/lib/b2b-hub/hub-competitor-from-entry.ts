import { COMPETITOR_LABEL } from "@/lib/b2b-hub/competitors"
import type { HubEntry } from "@/lib/b2b-hub/registry"

export function hubEntryCompetitorSlug(entry: HubEntry): string | null {
  const { segment, slug } = entry
  if (segment === "alternatives") return slug
  if (segment === "compare" && slug.startsWith("consentz-vs-")) {
    return slug.slice("consentz-vs-".length)
  }
  if (segment === "migrate" && slug.startsWith("from-")) {
    return slug.slice("from-".length)
  }
  if (segment === "pricing" && slug.endsWith("-pricing-alternative")) {
    return slug.slice(0, -"-pricing-alternative".length)
  }
  if (segment === "cqc" && slug.endsWith("-cqc-compliance-alternative")) {
    return slug.slice(0, -"-cqc-compliance-alternative".length)
  }
  if (segment === "consent" && slug.endsWith("-consent-form-alternative")) {
    return slug.slice(0, -"-consent-form-alternative".length)
  }
  if (segment === "automation" && slug.endsWith("-automation-alternative")) {
    return slug.slice(0, -"-automation-alternative".length)
  }
  return null
}

export function hubEntryCompetitorLabel(entry: HubEntry): string | null {
  const key = hubEntryCompetitorSlug(entry)
  if (!key) return null
  return COMPETITOR_LABEL[key] ?? key.replaceAll("-", " ")
}
