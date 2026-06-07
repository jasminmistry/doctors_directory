import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HubTemplateDownloadPage } from "@/components/b2b-hub/hub-template-download-page"
import { getExpansionCityTitle, isExpansionCitySlug } from "@/lib/b2b-hub/expansion-cities"
import {
  TEMPLATE_ENTRIES,
  buildTemplateExpansionPath,
  getTemplateEntry,
  getTemplateEntryBySlug,
  isTemplateCategory,
  templatePageHref,
} from "@/lib/b2b-hub/templates-registry"
import {
  buildHubPageMetadata,
  hubTemplateCityMetaDescription,
  hubTemplateCityMetaTitle,
  hubTemplateDetailMetaDescription,
  hubTemplateDetailMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata"

type Props = { params: { category: string; slug: string } }

function isTemplateCityExpansionRoute(templateSlug: string, secondSegment: string) {
  return isExpansionCitySlug(secondSegment) && !!getTemplateEntryBySlug(templateSlug)
}

export function generateStaticParams() {
  return TEMPLATE_ENTRIES.map((e) => ({
    category: e.category,
    slug: e.slug,
  }))
}

export function generateMetadata({ params }: Props): Metadata {
  if (isTemplateCityExpansionRoute(params.category, params.slug)) {
    const entry = getTemplateEntryBySlug(params.category)
    if (!entry) {
      return { title: "Not found" }
    }
    const cityTitle = getExpansionCityTitle(params.slug)
    return buildHubPageMetadata({
      title: hubTemplateCityMetaTitle(entry.title, cityTitle),
      description: hubTemplateCityMetaDescription(entry.summary, cityTitle),
      canonicalPath: buildTemplateExpansionPath(entry.slug, params.slug),
      ogType: "article",
    })
  }
  if (!isTemplateCategory(params.category)) {
    return { title: "Template" }
  }
  const entry = getTemplateEntry(params.category, params.slug)
  if (!entry) {
    return { title: "Not found" }
  }
  return buildHubPageMetadata({
    title: hubTemplateDetailMetaTitle(entry.title),
    description: hubTemplateDetailMetaDescription(entry.summary),
    canonicalPath: templatePageHref(entry),
    ogType: "article",
  })
}

export default function TemplateDetailPage({ params }: Props) {
  if (isTemplateCityExpansionRoute(params.category, params.slug)) {
    const entry = getTemplateEntryBySlug(params.category)
    if (!entry) {
      notFound()
    }
    return (
      <HubTemplateDownloadPage
        entry={entry}
        cityTitle={getExpansionCityTitle(params.slug)}
        canonicalPath={buildTemplateExpansionPath(entry.slug, params.slug)}
      />
    )
  }
  if (!isTemplateCategory(params.category)) {
    notFound()
  }
  const entry = getTemplateEntry(params.category, params.slug)
  if (!entry) {
    notFound()
  }
  return <HubTemplateDownloadPage entry={entry} />
}
