import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
  getDirectoryTreatmentBases,
  parseTreatmentPageSlug,
  type TreatmentPageType,
} from "@/lib/b2b-hub/scaled-pages"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { HubLocalizedPageHero } from "@/components/b2b-hub/hub-localized-page-hero"
import { HubOperationalInsightBlock } from "@/components/b2b-hub/hub-operational-insight-block"
import {
  buildHubPageMetadata,
  hubTreatmentPageMetaDescription,
  hubTreatmentPageMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata"
import { buildTreatmentOperationalInsight } from "@/lib/b2b-hub/operational-insight"

type Props = { params: { slug: string } }

export const revalidate = 300

const TYPE_LABEL: Record<TreatmentPageType, string> = {
  "consent-workflows": "Consent Workflows",
  "automation-workflows": "Automation Workflows",
  "clinic-management-software": "Clinic Management Software",
  workflows: "Workflows",
}

function findTreatmentLabel(treatmentSlug: string) {
  const match = getDirectoryTreatmentBases(8, 100).find((t) => t.slug === treatmentSlug)
  return match?.label
}

export function generateMetadata({ params }: Props): Metadata {
  const parsed = parseTreatmentPageSlug(params.slug)
  if (!parsed) return { title: "Treatments" }
  const label = findTreatmentLabel(parsed.treatmentSlug)
  if (!label) return { title: "Treatments" }
  const treatmentLabel = toDisplayTitle(label)
  const typeLabel = TYPE_LABEL[parsed.pageType]
  return buildHubPageMetadata({
    title: hubTreatmentPageMetaTitle(treatmentLabel, typeLabel),
    description: hubTreatmentPageMetaDescription(treatmentLabel, typeLabel),
    canonicalPath: `/business/treatments/${params.slug}/`,
    ogType: "article",
  })
}

export default function BusinessTreatmentDetailPage({ params }: Props) {
  const parsed = parseTreatmentPageSlug(params.slug)
  if (!parsed) notFound()
  const label = findTreatmentLabel(parsed.treatmentSlug)
  if (!label) notFound()

  const title = `${toDisplayTitle(label)} ${TYPE_LABEL[parsed.pageType]}`
  const treatmentLabel = toDisplayTitle(label)
  const operationalInsight = buildTreatmentOperationalInsight(
    treatmentLabel,
    parsed.pageType
  )
  const relatedSlugs = ([
    "consent-workflows",
    "automation-workflows",
    "clinic-management-software",
    "workflows",
  ] as TreatmentPageType[])
    .filter((t) => t !== parsed.pageType)
    .map((t) => `${parsed.treatmentSlug}-${t}`)

  return (
    <>
      <HubLocalizedPageHero
        eyebrow="Treatments"
        title={title}
        description="Treatment-focused page built with controlled combinations to keep scale useful: treatment × consent, treatment × automation, and treatment × software."
      />
      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-12 pb-10">
      <HubOperationalInsightBlock insight={operationalInsight} />

      <section className="mb-12 grid sm:grid-cols-2 gap-3">
        <Link href="/business/consent/" className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400  transition-all">
          <p className="font-medium text-neutral-900">Consent</p>
          <p className="text-sm text-neutral-500 mt-1">
            {toDisplayTitle("Treatment consent workflows")}
          </p>
        </Link>
        <Link href="/business/automation/" className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400  transition-all">
          <p className="font-medium text-neutral-900">Automation</p>
          <p className="text-sm text-neutral-500 mt-1">
            {toDisplayTitle("Treatment automation pathways")}
          </p>
        </Link>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white px-6 py-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
          {toDisplayTitle("Related Treatment Pages")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {relatedSlugs.map((slug) => (
            <Link
              key={slug}
              href={`/business/treatments/${slug}/`}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
            >
              {toDisplayTitle(slug.replaceAll("-", " "))}
            </Link>
          ))}
        </div>
      </section>
    </div>
    </>
  )
}
