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

export function getHubTemplateLibraryItems(
  exclude?: { category: TemplateCategory; slug: string }
): HubTemplateLibraryItem[] {
  return buildHubTemplateLibraryItems(
    exclude ? { category: exclude.category, slug: exclude.slug } : undefined
  )
}

export function countHubTemplateLibraryByFormat(
  items: HubTemplateLibraryItem[]
): Record<HubTemplateLibraryFormat, number> {
  const counts: Record<HubTemplateLibraryFormat, number> = {
    all: items.length,
    carousels: 0,
    stories: 0,
    reels: 0,
    email: 0,
    forms: 0,
    cqc: 0,
  }
  for (const item of items) {
    counts[item.format] += 1
  }
  return counts
}

/** @deprecated Use getHubTemplateLibraryItems() */
export const HUB_TEMPLATE_LIBRARY_ITEMS = getHubTemplateLibraryItems()
