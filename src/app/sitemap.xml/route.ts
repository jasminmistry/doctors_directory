import { buildSitemapIndexXml, toDirectoryUrl, xmlResponse } from '@/lib/sitemap'

export async function GET() {
  const files = [
    'register.xml',
    'products-brands-base.xml', // ui
    'products-brands-list.xml',
    'products-brands-items.xml',
    'products-categories-base.xml',
    'products-categories-list.xml',
    'products-categories-items.xml',
    'treatments-base.xml',
    'all-treatments.xml',
    'practitioners-base.xml',
    'practitioners-cities.xml',
    'all-practitioners.xml',
    'practitioners-treatments.xml',
    'practitioners-treatments-details.xml',
    'practitioners-credentials-base.xml',
    'practitioners-credentials-details.xml',
    'practitioners-treatment-by-city.xml',
    'clinics-base.xml',
    'clinics-cities.xml',
    'all-clinics.xml',
    'clinics-services.xml',
    'clinics-services-details.xml',
    'clinics-treatment-by-city.xml',
    'accredited-base.xml',
    'accredited-clinics.xml',
    'accredited-clinics-cities.xml',
    'accredited-practitioners.xml',
    'accredited-practitioners-cities.xml',
  ]

  const xml = buildSitemapIndexXml(
    files.map((file) => toDirectoryUrl(`/${file}`))
  )

  return xmlResponse(xml)
}