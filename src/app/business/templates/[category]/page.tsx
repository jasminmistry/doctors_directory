import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HubIndexSearchCards } from "@/components/b2b-hub/hub-index-search-cards"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import {
  TEMPLATE_CATEGORY_LABEL,
  isTemplateCategory,
  templatesByCategory,
  templatePageHref,
  type TemplateCategory,
} from "@/lib/b2b-hub/templates-registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"

type Props = { params: { category: string } }

export function generateStaticParams() {
  return (
    [
      "consent",
      "intake",
      "aftercare",
      "cqc-policies",
      "sop",
    ] as TemplateCategory[]
  ).map((category) => ({ category }))
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isTemplateCategory(params.category)) {
    return { title: "Templates" }
  }
  const label = TEMPLATE_CATEGORY_LABEL[params.category]
  const title = `${label} | Consentz Templates`
  const description = `Free ${label.toLowerCase()} for UK aesthetic clinics — download and customise.`
  const url = toCurrentSiteUrl(`/business/templates/${params.category}/`)
  return {
    metadataBase: new URL(b2bBaseUrl()),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
    },
  }
}

export default function TemplateCategoryPage({ params }: Props) {
  if (!isTemplateCategory(params.category)) {
    notFound()
  }
  const cat = params.category
  const entries = templatesByCategory(cat)
  if (entries.length === 0) {
    notFound()
  }
  const label = TEMPLATE_CATEGORY_LABEL[cat]

  const cards = entries.map((e) => ({
    key: `${e.category}-${e.slug}`,
    href: templatePageHref(e),
    title: toDisplayTitle(e.title),
    subtitle: e.summary,
  }))

  return (
    <>
      <HubIndexSearchCards
        heroTitle={label}
        heroSubtitle={`${entries.length} free templates. Download, customise, and digitise with Consentz.`}
        searchPlaceholder={`Search ${label.toLowerCase()}`}
        entries={cards}
        heroInputId={`templates-${cat}-search`}
      />
      <HubSectionCta
        heading="Ready To Digitise Your Templates?"
        sub="Book a demo to see how Consentz automates consent, intake, and evidence workflows."
        secondaryLabel="All Templates"
        secondaryHref="/business/templates/"
      />
    </>
  )
}
