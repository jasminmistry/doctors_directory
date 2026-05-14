import { HUB_ENTRIES } from "@/lib/b2b-hub/registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

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
      label: "Clinic Automation Software",
      href: "/business/automation/clinic-automation-software/",
    },
  ]
  return [...peers, ...pad].slice(0, 9)
}

export const PRACTITIONER_TOOLS_EXTERNAL = `${baseUrl}/book-demo`
