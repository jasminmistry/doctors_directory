import { accreditations } from '@/lib/data'
import {
  buildUrlSetXml,
  encodeSegment,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { getEnrichedPractitionersFromDb, normalizeCredentialToken } from '@/lib/sitemap-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const practitioners = await getEnrichedPractitionersFromDb()

  const paths = accreditations
    .filter((credential) => {
      const token = normalizeCredentialToken(credential)
      return practitioners.some((entry) => {
        const qualifications = normalizeCredentialToken(
          entry.practitioner_qualifications ?? ''
        )
        const awards = normalizeCredentialToken(entry.practitioner_awards ?? '')
        return qualifications.includes(token) || awards.includes(token)
      })
    })
    .map(
      (credential) =>
        `/practitioners/credentials/${encodeSegment(credential.toLowerCase())}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
