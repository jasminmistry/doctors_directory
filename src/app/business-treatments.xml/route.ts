import { buildUrlSetXml, mapBusinessHubPathsToSitemapUrls, xmlResponse } from "@/lib/sitemap"
import {
  buildTreatmentPageSlug,
  getDirectoryTreatmentBases,
  TREATMENT_PAGE_TYPES,
} from "@/lib/b2b-hub/scaled-pages"

export async function GET() {
  const treatments = getDirectoryTreatmentBases(8, 60)
  const paths = [
    "/business/treatments/",
    ...treatments.flatMap((t) =>
      TREATMENT_PAGE_TYPES.map((type) => `/business/treatments/${buildTreatmentPageSlug(t.slug, type)}/`)
    ),
  ]
  const xml = buildUrlSetXml(mapBusinessHubPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
