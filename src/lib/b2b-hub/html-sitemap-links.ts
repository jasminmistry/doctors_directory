import {
  directoryCityNameToSlug,
  getUniqueDirectoryCityNames,
} from "@/lib/b2b-hub/directory-cities"
import {
  buildTreatmentPageSlug,
  CITY_LOCAL_PAGE_SLUGS,
  getDirectoryTreatmentBases,
  TREATMENT_PAGE_TYPES,
  type TreatmentPageType,
} from "@/lib/b2b-hub/scaled-pages"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

export type HtmlSitemapLink = {
  href: string
  label: string
}

export type B2bCitySitemapGroup = {
  city: string
  citySlug: string
  links: HtmlSitemapLink[]
}

const topicLabel = (pageSlug: string) =>
  toDisplayTitle(pageSlug.replaceAll("-", " "))

const treatmentTypeLabel = (type: TreatmentPageType) =>
  toDisplayTitle(type.replaceAll("-", " "))

export function getB2bCitySitemapGroups(): B2bCitySitemapGroup[] {
  return getUniqueDirectoryCityNames().map((city) => {
    const citySlug = directoryCityNameToSlug(city)
    return {
      city,
      citySlug,
      links: CITY_LOCAL_PAGE_SLUGS.map((pageSlug) => ({
        href: `/business/uk/${citySlug}/${pageSlug}/`,
        label: topicLabel(pageSlug),
      })),
    }
  })
}

export function getB2bTreatmentSitemapLinks(): HtmlSitemapLink[] {
  const treatments = getDirectoryTreatmentBases(8, 100)
  return [
    { href: "/business/treatments/", label: "Treatment workflows index" },
    ...treatments.flatMap((t) =>
      TREATMENT_PAGE_TYPES.map((type) => ({
        href: `/business/treatments/${buildTreatmentPageSlug(t.slug, type)}/`,
        label: `${t.label} — ${treatmentTypeLabel(type)}`,
      }))
    ),
  ]
}

export function countB2bScaledSitemapPages(): {
  cityCount: number
  cityPageCount: number
  treatmentPageCount: number
} {
  const cityGroups = getB2bCitySitemapGroups()
  const cityPageCount = cityGroups.reduce((n, g) => n + g.links.length, 0)
  return {
    cityCount: cityGroups.length,
    cityPageCount,
    treatmentPageCount: getB2bTreatmentSitemapLinks().length,
  }
}
