import {
  COMPETITOR_LABEL,
  type CompetitorSlug,
} from "@/lib/b2b-hub/competitors"

const PEER_ALTERNATIVES: CompetitorSlug[] = ["pabau", "fresha", "treatwell"]

export type AlternativesNavLink = { label: string; href: string }

/**
 * Fixed 3×3 grid for alternatives landing pages (Figma): compare / migrate / CQC
 * for this competitor, two peer alternatives, then pillar shortcuts.
 */
export function alternativesHubNavLinks(compSlug: string): AlternativesNavLink[] {
  const label = COMPETITOR_LABEL[compSlug] ?? compSlug
  const peers = PEER_ALTERNATIVES.filter((p) => p !== compSlug).slice(0, 2)
  const peer0 = peers[0] ?? "fresha"
  const peer1 = peers[1] ?? "treatwell"

  return [
    { label: `Consentz vs ${label}`, href: `/business/compare/consentz-vs-${compSlug}/` },
    { label: `Migrate from ${label}`, href: `/business/migrate/from-${compSlug}/` },
    {
      label: `${label} CQC Alternative`,
      href: `/business/cqc/${compSlug}-cqc-compliance-alternative/`,
    },
    {
      label: `${COMPETITOR_LABEL[peer0]} Alternative`,
      href: `/business/alternatives/${peer0}/`,
    },
    {
      label: `${COMPETITOR_LABEL[peer1]} Alternative`,
      href: `/business/alternatives/${peer1}/`,
    },
    {
      label: "Aesthetic Clinic Management",
      href: "/business/software/aesthetic-clinic-software/",
    },
    {
      label: "CQC Compliance Software",
      href: "/business/cqc/cqc-compliance-software-for-clinics/",
    },
    {
      label: "Clinic Automation Software",
      href: "/business/automation/clinic-automation-software/",
    },
    {
      label: "Patient Reactivation",
      href: "/business/automation/clinic-reactivation-automation-software/",
    },
  ]
}
