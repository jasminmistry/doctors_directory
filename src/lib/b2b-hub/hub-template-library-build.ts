import {
  CONSENTZ_CONTROL_REGISTRATION_URL,
  TEMPLATE_ENTRIES,
  TEMPLATE_CATEGORY_LABEL,
  type TemplateCategory,
  type TemplateEntry,
} from "@/lib/b2b-hub/templates-registry"
import type {
  HubTemplateLibraryFormat,
  HubTemplateLibraryItem,
} from "@/lib/b2b-hub/hub-template-library-data"
import { hubTemplateThumbnailForKey } from "@/lib/b2b-hub/hub-template-thumbnails"
import {
  MARKETING_TEMPLATE_SEEDS,
  type MarketingTemplateSeed,
} from "@/lib/b2b-hub/hub-marketing-template-library"

const CATEGORY_FORMAT: Record<TemplateCategory, Exclude<HubTemplateLibraryFormat, "all">> = {
  consent: "forms",
  intake: "forms",
  aftercare: "forms",
  "cqc-policies": "cqc",
  sop: "cqc",
  "risk-assessment": "forms",
  "treatment-record": "forms",
  marketing: "carousels",
  business: "email",
  hr: "forms",
  pricing: "email",
}

const TAG_BADGE_CLASS = "bg-[#1A1A1A] text-white" as const

function tagLabel(category: TemplateCategory): string {
  return TEMPLATE_CATEGORY_LABEL[category]
    .replace(/ Templates?$/i, "")
    .replace(/ Template$/i, "")
    .toUpperCase()
}

function secondaryTag(category: TemplateCategory): string | undefined {
  if (category === "consent" || category === "aftercare") return "AESTHETICS"
  if (category === "intake") return "CLINIC OPS"
  if (category === "cqc-policies") return "GOVERNANCE"
  if (category === "sop") return "CLINICAL"
  return undefined
}

function stableDownloads(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return 40 + (Math.abs(h) % 120)
}

export function hubLibraryItemFromEntry(entry: TemplateEntry): HubTemplateLibraryItem {
  const primary = tagLabel(entry.category)
  const secondary = secondaryTag(entry.category)
  const id = `${entry.category}-${entry.slug}`
  return {
    id,
    title: entry.title,
    description: entry.summary,
    date: "May 2026",
    format: CATEGORY_FORMAT[entry.category],
    image: hubTemplateThumbnailForKey(id),
    href: CONSENTZ_CONTROL_REGISTRATION_URL,
    tags: secondary ? [primary, secondary] : [primary],
    tagColors: [TAG_BADGE_CLASS, TAG_BADGE_CLASS],
    author: "Consentz Clinical Team",
    downloads: stableDownloads(entry.slug),
    internal: false,
  }
}

export function hubLibraryItemFromMarketingSeed(seed: MarketingTemplateSeed): HubTemplateLibraryItem {
  const tags = seed.tagSecondary ? [seed.tagPrimary, seed.tagSecondary] : [seed.tagPrimary]
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    date: "May 2026",
    format: seed.format,
    image: hubTemplateThumbnailForKey(seed.id),
    href: CONSENTZ_CONTROL_REGISTRATION_URL,
    tags,
    tagColors: [TAG_BADGE_CLASS, TAG_BADGE_CLASS],
    author: "Consentz Team",
    downloads: stableDownloads(seed.id),
    internal: false,
  }
}

export function buildHubTemplateLibraryItems(
  exclude?: Pick<TemplateEntry, "category" | "slug">
): HubTemplateLibraryItem[] {
  const fromRegistry = TEMPLATE_ENTRIES.filter(
    (e) => !(exclude && e.category === exclude.category && e.slug === exclude.slug)
  ).map(hubLibraryItemFromEntry)

  const marketing = MARKETING_TEMPLATE_SEEDS.map(hubLibraryItemFromMarketingSeed)
  const seen = new Set(fromRegistry.map((i) => i.id))
  const extraMarketing = marketing.filter((i) => !seen.has(i.id))
  return [...fromRegistry, ...extraMarketing]
}
