import {
  AUTOMATION_TOOL_ORDER,
  isAutomationToolHubSlug,
} from "@/lib/b2b-hub/automation-tool-entries"
import { getHubEntry } from "@/lib/b2b-hub/registry"

const AUTOMATION_CORE_ORDER = [
  "clinic-reactivation-automation-software",
  "patient-journey-automation-software",
  "clinic-marketing-automation-software",
  "aesthetic-clinic-automation-software",
  "clinic-automation-software",
  "med-spa-automation-software",
  "laser-clinic-automation-software",
  "skin-clinic-automation-software",
  "hair-clinic-automation-software",
  "weight-loss-clinic-automation-software",
  "wellness-clinic-automation-software",
  "longevity-clinic-automation-software",
  "dental-aesthetic-clinic-automation-software",
] as const;

export type AutomationNavLink = { label: string; href: string };

function slugsToNavLinks(slugs: string[]): AutomationNavLink[] {
  return slugs.map((slug) => {
    const e = getHubEntry("automation", slug)
    return {
      label: e?.title ?? slug,
      href: `/business/automation/${slug}/`,
    }
  })
}

export function automationHubNavLinks(currentSlug: string): AutomationNavLink[] {
  if (isAutomationToolHubSlug(currentSlug)) {
    const toolSlugs = AUTOMATION_TOOL_ORDER.filter((s) => s !== currentSlug).slice(
      0,
      9
    )
    return slugsToNavLinks(toolSlugs)
  }
  const clinicSlugs = AUTOMATION_CORE_ORDER.filter((s) => s !== currentSlug).slice(
    0,
    9
  )
  return slugsToNavLinks(clinicSlugs)
}
