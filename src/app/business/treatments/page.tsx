import type { Metadata } from "next"
import Link from "next/link"
import {
  buildTreatmentPageSlug,
  getDirectoryTreatmentBases,
  TREATMENT_PAGE_TYPES,
  type TreatmentPageType,
} from "@/lib/b2b-hub/scaled-pages"
import { toBusinessHubUrl } from "@/lib/sitemap"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { b2bBaseUrl, b2bOgImageUrl } from "@/lib/b2b-hub/seo"

export const metadata: Metadata = {
  metadataBase: new URL(b2bBaseUrl()),
  title: "Treatments | B2B Buyer Hub",
  description:
    "Treatment-based B2B pages connecting consent, automation, and software workflows.",
  alternates: {
    canonical: toBusinessHubUrl("/business/treatments/"),
  },
  openGraph: {
    title: "Treatments | B2B Buyer Hub",
    description:
      "Treatment-based B2B pages connecting consent, automation, and software workflows.",
    type: "website",
    url: toBusinessHubUrl("/business/treatments/"),
    images: [{ url: b2bOgImageUrl() }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Treatments | B2B Buyer Hub",
    description:
      "Treatment-based B2B pages connecting consent, automation, and software workflows.",
    images: [b2bOgImageUrl()],
  },
}

const TYPE_LABEL: Record<TreatmentPageType, string> = {
  "consent-workflows": "Consent Workflows",
  "automation-workflows": "Automation Workflows",
  "clinic-management-software": "Clinic Management Software",
  workflows: "Workflows",
}

export default function BusinessTreatmentIndexPage() {
  const treatments = getDirectoryTreatmentBases(8, 40)

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
          Treatments
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
          Controlled treatment-based pages linking consent, automation, practitioner
          workflows, and software context.
        </p>
      </header>

      <div className="space-y-6">
        {treatments.map((t) => (
          <section key={t.slug} className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">
              {toDisplayTitle(t.label)}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {TREATMENT_PAGE_TYPES.map((type) => {
                const slug = buildTreatmentPageSlug(t.slug, type)
                return (
                  <Link
                    key={type}
                    href={`/business/treatments/${slug}/`}
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    {TYPE_LABEL[type]}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
