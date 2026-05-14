import { getHubEntry } from "@/lib/b2b-hub/registry";

const TEMPLATES_CORE_ORDER = [
  "how-to-automate-an-aesthetic-clinic",
  "how-to-automate-patient-reactivation",
  "how-to-automate-consent-form-follow-up",
  "how-to-automate-no-show-recovery",
  "how-to-automate-cqc-compliance-evidence",
  "how-to-automate-treatment-launches",
  "how-to-automate-aftercare-messages",
] as const;

export type TemplatesNavLink = { label: string; href: string };

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

/** Nine cards: other template guides first, then cross-links to fill the grid. */
export function templatesHubNavLinks(currentSlug: string): TemplatesNavLink[] {
  const others = TEMPLATES_CORE_ORDER.filter((s) => s !== currentSlug).map((slug) => {
    const e = getHubEntry("templates", slug);
    return {
      label: e?.title ?? slug,
      href: `/business/templates/${slug}/`,
    };
  });
  const pad: TemplatesNavLink[] = [
    {
      label: "Medical Templates Library",
      href: `${baseUrl}/medical-templates/`,
    },
    {
      label: "Clinic Automation Software",
      href: "/business/automation/clinic-automation-software/",
    },
    {
      label: "CQC Inspection Readiness",
      href: "/business/cqc/cqc-inspection-readiness-software/",
    },
  ];
  return [...others, ...pad].slice(0, 9);
}
