import { HUB_ENTRIES } from "@/lib/b2b-hub/registry"
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

export type PractitionersNavLink = { label: string; href: string }

export function practitionersHubNavLinks(currentSlug: string): PractitionersNavLink[] {
  const peers = HUB_ENTRIES.filter((e) => e.segment === "practitioners" && e.slug !== currentSlug)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 8)
    .map((e) => ({
      label: toDisplayTitle(e.title),
      href: `/business/practitioners/${e.slug}/`,
    }))
  const pad: PractitionersNavLink[] = [
    {
      label: "Clinic Software",
      href: "/business/software/",
    },
  ]
  return [...peers, ...pad].slice(0, 9)
}

export const PRACTITIONER_TOOLS_EXTERNAL = b2bBookDemoHref()
