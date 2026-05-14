import { HUB_ENTRIES } from "@/lib/b2b-hub/registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

export type ConsentNavLink = { label: string; href: string }

export function isCoreConsentHubSlug(slug: string) {
  return !slug.includes("-consent-form-alternative")
}

function isCoreConsentHub(e: { segment: string; slug: string }) {
  return (
    e.segment === "consent" &&
    !e.slug.includes("-consent-form-alternative")
  )
}

export function consentHubNavLinks(currentSlug: string): ConsentNavLink[] {
  const peers = HUB_ENTRIES.filter((e) => isCoreConsentHub(e) && e.slug !== currentSlug)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 8)
    .map((e) => ({
      label: toDisplayTitle(e.title),
      href: `/business/consent/${e.slug}/`,
    }))
  const pad: ConsentNavLink[] = [
    {
      label: "Clinic Automation Software",
      href: "/business/automation/clinic-automation-software/",
    },
  ]
  return [...peers, ...pad].slice(0, 9)
}
