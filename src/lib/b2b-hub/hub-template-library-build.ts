import {
  TEMPLATE_ENTRIES,
  TEMPLATE_CATEGORY_LABEL,
  templatePageHref,
  type TemplateCategory,
  type TemplateEntry,
} from "@/lib/b2b-hub/templates-registry"
import type {
  HubTemplateLibraryFormat,
  HubTemplateLibraryItem,
} from "@/lib/b2b-hub/hub-template-library-data"

const CATEGORY_PREVIEW: Record<TemplateCategory, string> = {
  consent: "/directory/images/HIPAA-Compliant-Medical-Spa-Software-768x432.webp",
  intake: "/directory/images/Aesthetic Software Interface.webp",
  aftercare: "/directory/images/Aesthetic-Clinic-Marketing-Guide-1536x864.webp",
  "cqc-policies": "/directory/images/cqc-hub/mid-caring.png",
  sop: "/directory/images/cqc-hub/mid-domains.png",
  "risk-assessment": "/directory/images/cqc-hub/hero-screen.png",
  "treatment-record": "/directory/images/cqc-hub/hero-float-1.png",
  marketing: "/directory/images/Aesthetic-Clinic-Marketing-Guide-1536x864.webp",
  business: "/directory/images/Software Buyer Hub Hero Collage.png",
  hr: "/directory/images/Software Buyer Hub Service Strip.png",
  pricing: "/directory/images/cqc-hub/mid-heatmap.png",
}

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

const TAG_COLORS = [
  "bg-[#1a877a] text-white",
  "bg-[#5B9BD5] text-white",
  "bg-[#C75B5B] text-white",
  "bg-[#7B9E6B] text-white",
] as const

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
  return {
    id: `${entry.category}-${entry.slug}`,
    title: entry.title,
    description: entry.summary,
    date: "May 2026",
    format: CATEGORY_FORMAT[entry.category],
    image: CATEGORY_PREVIEW[entry.category],
    href: templatePageHref(entry),
    tags: secondary ? [primary, secondary] : [primary],
    tagColors: [TAG_COLORS[0], TAG_COLORS[1]],
    author: "Consentz Clinical Team",
    downloads: stableDownloads(entry.slug),
    internal: true,
  }
}

export function buildHubTemplateLibraryItems(
  exclude?: Pick<TemplateEntry, "category" | "slug">
): HubTemplateLibraryItem[] {
  const fromRegistry = TEMPLATE_ENTRIES.filter(
    (e) => !(exclude && e.category === exclude.category && e.slug === exclude.slug)
  ).map(hubLibraryItemFromEntry)

  return fromRegistry
}
