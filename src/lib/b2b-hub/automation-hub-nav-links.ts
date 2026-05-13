import { getHubEntry } from "@/lib/b2b-hub/registry";

/** Priority order for the 3×3 hub cards (current page excluded). */
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

export function automationHubNavLinks(currentSlug: string): AutomationNavLink[] {
  const ordered = AUTOMATION_CORE_ORDER.filter((s) => s !== currentSlug);
  const nine = ordered.slice(0, 9);
  return nine.map((slug) => {
    const e = getHubEntry("automation", slug);
    return {
      label: e?.title ?? slug,
      href: `/business/automation/${slug}/`,
    };
  });
}
