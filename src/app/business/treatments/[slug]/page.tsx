import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
  getDirectoryTreatmentBases,
  parseTreatmentPageSlug,
  type TreatmentPageType,
} from "@/lib/b2b-hub/scaled-pages"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"

type Props = { params: { slug: string } }

export const dynamic = "force-dynamic"

const TYPE_LABEL: Record<TreatmentPageType, string> = {
  "consent-workflows": "Consent Workflows",
  "automation-workflows": "Automation Workflows",
  "clinic-management-software": "Clinic Management Software",
  workflows: "Workflows",
}

function findTreatmentLabel(treatmentSlug: string) {
  const match = getDirectoryTreatmentBases(5, 120).find((t) => t.slug === treatmentSlug)
  return match?.label
}

export function generateMetadata({ params }: Props): Metadata {
  const parsed = parseTreatmentPageSlug(params.slug)
  if (!parsed) return { title: "Treatments" }
  const label = findTreatmentLabel(parsed.treatmentSlug)
  if (!label) return { title: "Treatments" }
  const title = `${toDisplayTitle(label)} ${TYPE_LABEL[parsed.pageType]}`
  const description = `${title} connecting consent, automation, practitioner and software pathways.`
  const url = toCurrentSiteUrl(`/business/treatments/${params.slug}/`)
  return {
    metadataBase: new URL(b2bBaseUrl()),
    title: `${title} | B2B Buyer Hub`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | B2B Buyer Hub`,
      description,
      type: "article",
      url,
      images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | B2B Buyer Hub`,
      description,
      images: [b2bOgImageUrl(["/images/Consentz Logo.webp"])],
    },
  }
}

export default function BusinessTreatmentDetailPage({ params }: Props) {
  const parsed = parseTreatmentPageSlug(params.slug)
  if (!parsed) notFound()
  const label = findTreatmentLabel(parsed.treatmentSlug)
  if (!label) notFound()

  const title = `${toDisplayTitle(label)} ${TYPE_LABEL[parsed.pageType]}`
  const relatedSlugs = ([
    "consent-workflows",
    "automation-workflows",
    "clinic-management-software",
    "workflows",
  ] as TreatmentPageType[])
    .filter((t) => t !== parsed.pageType)
    .map((t) => `${parsed.treatmentSlug}-${t}`)

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 md:pt-10 pb-16">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          Treatments
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
          Treatment-focused page built with controlled combinations to keep scale
          useful: treatment × consent, treatment × automation, and treatment × software.
        </p>
      </header>

      <section className="mb-12 grid sm:grid-cols-2 gap-3">
        <Link href="/business/consent/" className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all">
          <p className="font-medium text-neutral-900">Consent</p>
          <p className="text-sm text-neutral-500 mt-1">Treatment consent workflows</p>
        </Link>
        <Link href="/business/automation/" className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all">
          <p className="font-medium text-neutral-900">Automation</p>
          <p className="text-sm text-neutral-500 mt-1">Treatment automation pathways</p>
        </Link>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">Related Treatment Pages</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {relatedSlugs.map((slug) => (
            <Link
              key={slug}
              href={`/business/treatments/${slug}/`}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
            >
              {toDisplayTitle(slug.replaceAll("-", " "))}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
