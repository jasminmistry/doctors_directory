import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HubTemplateDownloadPage } from "@/components/b2b-hub/hub-template-download-page"
import {
  TEMPLATE_ENTRIES,
  getTemplateEntry,
  isTemplateCategory,
  templatePageHref,
} from "@/lib/b2b-hub/templates-registry"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"

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
  const title = `${entry.title} | Free Download | Consentz`
  const description = entry.summary
  const url = toCurrentSiteUrl(templatePageHref(entry).replace(/\/$/, "") + "/")
  return {
    metadataBase: new URL(b2bBaseUrl()),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
    },
  }
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
