import { buildUrlSetXml, xmlResponse } from '@/lib/sitemap'
// import { filterRemovedPractitioners } from '@/lib/directory-removals'
// import {
//   encodeCitySegment,
//   encodeSegment,
//   mapPathsToSitemapUrls,
// } from '@/lib/sitemap'
// import { getEnrichedPractitioners } from '@/lib/sitemap-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return xmlResponse(buildUrlSetXml([]))

  // const paths = filterRemovedPractitioners(getEnrichedPractitioners())
  //   .filter(
  //     (entry) =>
  //       typeof entry.practitioner_name === 'string' &&
  //       entry.practitioner_name.trim().length > 0 &&
  //       typeof entry.City === 'string' &&
  //       entry.City.trim().length > 0
  //   )
  //   .map(
  //     (entry) =>
  //       `/practitioners/${encodeCitySegment(entry.City)}/profile/${encodeSegment(
  //         entry.practitioner_name as string
  //       )}`
  //   )
  //
  // const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  // return xmlResponse(xml)
}
