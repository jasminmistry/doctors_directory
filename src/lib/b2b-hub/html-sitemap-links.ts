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
import {
  getB2bExpansionCities,
  getCqcExpansionCities,
  getExpansionCityTitle,
} from "@/lib/b2b-hub/expansion-cities"
import {
  B2B_EXPANSION_SEGMENTS,
  buildExpansionCanonicalPath,
  getExpansionHubEntries,
} from "@/lib/b2b-hub/expansion-pages"
import {
  buildTemplateExpansionPath,
  TEMPLATE_ENTRIES,
} from "@/lib/b2b-hub/templates-registry"
import { segmentLabel } from "@/lib/b2b-hub/registry"

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
        label: `${t.label}: ${treatmentTypeLabel(type)}`,
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

export type B2bExpansionSitemapGroup = {
  segment: string
  segmentLabel: string
  links: HtmlSitemapLink[]
}

export function countB2bExpansionSitemapPages(): {
  segmentCityCount: number
  templateCityCount: number
  total: number
} {
  const expansionCities = getB2bExpansionCities()
  const cqcExpansionCities = getCqcExpansionCities()
  const segmentCityCount = B2B_EXPANSION_SEGMENTS.reduce(
    (sum, segment) =>
      sum +
      getExpansionHubEntries(segment).length *
        (segment === "cqc" ? cqcExpansionCities.length : expansionCities.length),
    0
  )
  const templateCityCount = TEMPLATE_ENTRIES.length * expansionCities.length
  return {
    segmentCityCount,
    templateCityCount,
    total: segmentCityCount + templateCityCount,
  }
}

export function getB2bExpansionSitemapGroups(limitPerSegment = 40): B2bExpansionSitemapGroup[] {
  const expansionCities = getB2bExpansionCities()
  const cqcExpansionCities = getCqcExpansionCities()
  return B2B_EXPANSION_SEGMENTS.map((segment) => {
    const entries = getExpansionHubEntries(segment)
    const cities = segment === "cqc" ? cqcExpansionCities : expansionCities
    const links: HtmlSitemapLink[] = []
    for (const entry of entries) {
      for (const city of cities) {
        links.push({
          href: buildExpansionCanonicalPath(segment, entry.slug, city.slug),
          label: `${entry.title} — ${getExpansionCityTitle(city.slug)}`,
        })
        if (links.length >= limitPerSegment) {
          return {
            segment,
            segmentLabel: segmentLabel(segment),
            links,
          }
        }
      }
    }
    return {
      segment,
      segmentLabel: segmentLabel(segment),
      links,
    }
  })
}

export function getB2bTemplateExpansionSampleLinks(limit = 60): HtmlSitemapLink[] {
  const links: HtmlSitemapLink[] = []
  for (const entry of TEMPLATE_ENTRIES) {
    for (const city of getB2bExpansionCities()) {
      links.push({
        href: buildTemplateExpansionPath(entry.slug, city.slug),
        label: `${entry.title} — ${city.title}`,
      })
      if (links.length >= limit) {
        return links
      }
    }
  }
  return links
}
