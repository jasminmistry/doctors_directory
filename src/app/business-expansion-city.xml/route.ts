import { buildUrlSetXml, mapBusinessHubPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'
import { buildExpansionSitemapPaths } from '@/lib/b2b-hub/expansion-pages'
import { getB2bExpansionCities } from '@/lib/b2b-hub/expansion-cities'
import {
  buildTemplateExpansionPath,
  TEMPLATE_ENTRIES,
} from '@/lib/b2b-hub/templates-registry'

export async function GET() {
  const paths = [
    ...buildExpansionSitemapPaths(),
    ...TEMPLATE_ENTRIES.flatMap((entry) =>
      getB2bExpansionCities().map((city) =>
        buildTemplateExpansionPath(entry.slug, city.slug)
      )
    ),
  ]
  const xml = buildUrlSetXml(mapBusinessHubPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
