import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HubTemplateDownloadPage } from "@/components/b2b-hub/hub-template-download-page"
import {
  TEMPLATE_ENTRIES,
  getTemplateEntry,
  isTemplateCategory,
  templatePageHref,
} from "@/lib/b2b-hub/templates-registry"
import {
  buildHubPageMetadata,
  hubTemplateDetailMetaDescription,
  hubTemplateDetailMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata"

type Props = { params: { category: string; slug: string } }

export function generateStaticParams() {
  return TEMPLATE_ENTRIES.map((e) => ({
    category: e.category,
    slug: e.slug,
  }))
}

export function generateMetadata({ params }: Props): Metadata {
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
  if (!isTemplateCategory(params.category)) {
    notFound()
  }
  const entry = getTemplateEntry(params.category, params.slug)
  if (!entry) {
    notFound()
  }
  return <HubTemplateDownloadPage entry={entry} />
}
