import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { HubIndexSearchCards } from "@/components/b2b-hub/hub-index-search-cards"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import {
  buildHubPageMetadata,
  hubTemplateTreatmentIndexMetaDescription,
  hubTemplateTreatmentIndexMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata"
import {
  getTemplateTreatmentGroup,
  isTemplateTreatmentSlug,
  templatesByTreatment,
  TEMPLATE_TREATMENT_GROUPS,
} from "@/lib/b2b-hub/template-treatments"
import { templatePageHref } from "@/lib/b2b-hub/templates-registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

type Props = { params: { treatment: string } }

export function generateStaticParams() {
  return TEMPLATE_TREATMENT_GROUPS.map((g) => ({ treatment: g.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isTemplateTreatmentSlug(params.treatment)) {
    return { title: "Templates" }
  }
  const group = getTemplateTreatmentGroup(params.treatment)!
  return buildHubPageMetadata({
    title: hubTemplateTreatmentIndexMetaTitle(group.label),
    description: hubTemplateTreatmentIndexMetaDescription(group.label),
    canonicalPath: `/business/templates/treatment/${params.treatment}/`,
    ogType: "website",
  })
}

export default function TemplateTreatmentIndexPage({ params }: Props) {
  if (!isTemplateTreatmentSlug(params.treatment)) {
    notFound()
  }
  const group = getTemplateTreatmentGroup(params.treatment)!
  const entries = templatesByTreatment(params.treatment)
  if (entries.length === 0) {
    notFound()
  }

  const cards = entries.map((e) => ({
    key: `${e.category}-${e.slug}`,
    href: templatePageHref(e),
    title: toDisplayTitle(e.title),
    subtitle: e.summary,
  }))

  return (
    <>
      <HubIndexSearchCards
        heroTitle={`${group.label} Templates`}
        heroSubtitle={`${entries.length} free templates for ${group.label.toLowerCase()} — open each template to preview and download.`}
        searchPlaceholder={`Search ${group.label.toLowerCase()} templates`}
        entries={cards}
        heroInputId={`templates-treatment-${params.treatment}-search`}
      />
      <div className="mx-auto max-w-[1200px] px-4 pb-8 text-center">
        <Link
          href="/business/templates/"
          className="text-sm font-semibold text-[#111111] underline-offset-2 hover:underline"
        >
          ← All templates
        </Link>
      </div>
      <HubSectionCta
        heading="Ready To Digitise Your Templates?"
        sub="Book a demo to see how Consentz automates consent, intake, and evidence workflows."
        secondaryLabel="Browse By Category"
        secondaryHref="/business/templates/consent/"
      />
    </>
  )
}
