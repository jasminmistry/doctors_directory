import { buildHubTemplateLibraryItems } from "@/lib/b2b-hub/hub-template-library-build"
import type { TemplateCategory } from "@/lib/b2b-hub/templates-registry"

export type HubTemplateLibraryFormat =
  | "all"
  | "carousels"
  | "stories"
  | "reels"
  | "email"
  | "forms"
  | "cqc"

export type HubTemplateLibraryItem = {
  id: string
  title: string
  description: string
  date: string
  format: Exclude<HubTemplateLibraryFormat, "all">
  image: string
  href: string
  tags: string[]
  tagColors: readonly [string, string]
  author: string
  downloads: number
  internal: boolean
}

const EXTERNAL_SUPPLEMENT: HubTemplateLibraryItem[] = [
  {
    id: "ext-brochure",
    title: "Medical Brochure Templates For Healthcare Practices [2026 Guide]",
    description:
      "Clinic brochure layouts and copy frameworks for healthcare marketing teams.",
    date: "December 6, 2025",
    format: "carousels",
    image: "/directory/images/Aesthetic-Clinic-Marketing-Guide-1536x864.webp",
    href: "https://www.consentz.com/medical-brochure-templates/",
    tags: ["MARKETING", "CAROUSELS"],
    tagColors: ["bg-[#1a877a] text-white", "bg-[#5B9BD5] text-white"],
    author: "Consentz Team",
    downloads: 92,
    internal: false,
  },
]

export function getHubTemplateLibraryItems(
  exclude?: { category: TemplateCategory; slug: string }
): HubTemplateLibraryItem[] {
  const registry = buildHubTemplateLibraryItems(
    exclude ? { category: exclude.category, slug: exclude.slug } : undefined
  )
  const ids = new Set(registry.map((i) => i.id))
  const extra = EXTERNAL_SUPPLEMENT.filter((i) => !ids.has(i.id))
  return [...registry, ...extra]
}

/** @deprecated Use getHubTemplateLibraryItems() */
export const HUB_TEMPLATE_LIBRARY_ITEMS = getHubTemplateLibraryItems()
