import Link from 'next/link'
import type { Clinic, Practitioner } from '@/lib/types'
import { readJsonFileSync } from '@/lib/json-cache'
import { toUrlSlug } from '@/lib/utils'
import { toDirectoryCanonical } from '@/lib/seo'
import { modalities } from '@/lib/data'
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  hubSegmentCollectionHref,
  segmentLabel,
  type HubSegment,
} from '@/lib/b2b-hub/registry'
import {
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_ENTRIES,
  type TemplateCategory,
} from '@/lib/b2b-hub/templates-registry'
import { countB2bExpansionSitemapPages, countB2bScaledSitemapPages, getB2bCitySitemapGroups, getB2bExpansionSitemapGroups, getB2bTemplateExpansionSampleLinks, getB2bTreatmentSitemapLinks } from '@/lib/b2b-hub/html-sitemap-links'
import { countB2cSitemapPages } from '@/lib/b2c-sitemap-counts'

const ACCREDITATIONS = [
  { key: 'cqc', name: 'Care Quality Commission (CQC)', field: 'isCQC' },
  { key: 'jccp', name: 'Joint Council for Cosmetic Practitioners (JCCP)', field: 'isJCCP' },
  { key: 'hiw', name: 'Health Inspectorate Wales (HIW)', field: 'isHIW' },
  { key: 'his', name: 'Healthcare Improvement Scotland (HIS)', field: 'isHIS' },
  { key: 'rqia', name: 'Regulation and Quality Improvement Authority (RQIA)', field: 'isRQIA' },
  { key: 'saveface', name: 'SaveFace', field: 'isSaveFace' },
] as const

const XML_SITEMAPS: { file: string; label: string }[] = [
  { file: 'sitemap.xml', label: 'Sitemap Index' },
  { file: 'register.xml', label: 'Register Pages' },
  { file: 'all-clinics.xml', label: 'All Clinic Pages' },
  { file: 'all-practitioners.xml', label: 'All Practitioner Pages' },
  { file: 'all-treatments.xml', label: 'All Treatment Pages' },
  { file: 'clinics-base.xml', label: 'Clinics — Base' },
  { file: 'clinics-cities.xml', label: 'Clinics — Cities' },
  { file: 'clinics-services.xml', label: 'Clinics — Services' },
  { file: 'clinics-services-details.xml', label: 'Clinics — Service Details' },
  { file: 'clinics-treatment-by-city.xml', label: 'Clinics — Treatment by City' },
  { file: 'practitioners-base.xml', label: 'Practitioners — Base' },
  { file: 'practitioners-cities.xml', label: 'Practitioners — Cities' },
  { file: 'practitioners-treatments.xml', label: 'Practitioners — Treatments' },
  { file: 'practitioners-treatments-details.xml', label: 'Practitioners — Treatment Details' },
  { file: 'practitioners-credentials-base.xml', label: 'Practitioners — Credentials' },
  { file: 'practitioners-credentials-details.xml', label: 'Practitioners — Credential Details' },
  { file: 'practitioners-treatment-by-city.xml', label: 'Practitioners — Treatment by City' },
  { file: 'products-brands-base.xml', label: 'Products — Brands Base' },
  { file: 'products-brands-list.xml', label: 'Products — Brand List' },
  { file: 'products-brands-items.xml', label: 'Products — Brand Items' },
  { file: 'products-categories-base.xml', label: 'Products — Categories Base' },
  { file: 'products-categories-list.xml', label: 'Products — Category List' },
  { file: 'products-categories-items.xml', label: 'Products — Category Items' },
  { file: 'accredited-base.xml', label: 'Accredited — Base' },
  { file: 'accredited-clinics.xml', label: 'Accredited — Clinics' },
  { file: 'accredited-clinics-cities.xml', label: 'Accredited — Clinic Cities' },
  { file: 'accredited-practitioners.xml', label: 'Accredited — Practitioners' },
  { file: 'accredited-practitioners-cities.xml', label: 'Accredited — Practitioner Cities' },
  { file: 'treatments-base.xml', label: 'Treatments — Base' },
  { file: 'service-city-pages.xml', label: 'Directory — Service category by city' },
  { file: 'treatment-city-hub-pages.xml', label: 'Directory — Treatment hub by city' },
  { file: 'standalone-treatment-product-pages.xml', label: 'Directory — Standalone treatments and products' },
  { file: 'best-in-city-pages.xml', label: 'Directory — Best in city editorials' },
]

const B2B_XML_SITEMAPS: { file: string; label: string }[] = [
  { file: 'business-sitemap.xml', label: 'B2B buyer hub — Index' },
  { file: 'business-hub.xml', label: 'B2B buyer hub — Hub root' },
  { file: 'business-uk.xml', label: 'B2B buyer hub — By city index' },
  { file: 'business-uk-city.xml', label: 'B2B buyer hub — City localized pages' },
  { file: 'business-expansion-city.xml', label: 'B2B buyer hub — Expansion city (index → 4 chunks)' },
  { file: 'business-expansion-city1.xml', label: 'B2B buyer hub — Expansion city chunk 1 (~40k URLs)' },
  { file: 'business-expansion-city2.xml', label: 'B2B buyer hub — Expansion city chunk 2 (~40k URLs)' },
  { file: 'business-expansion-city3.xml', label: 'B2B buyer hub — Expansion city chunk 3 (~40k URLs)' },
  { file: 'business-expansion-city4.xml', label: 'B2B buyer hub — Expansion city chunk 4 (~40k URLs)' },
  { file: 'business-treatments.xml', label: 'B2B buyer hub — Treatment pages' },
  ...HUB_SEGMENTS.map((s: HubSegment) => ({
    file: `business-${s}.xml`,
    label: `B2B buyer hub — ${segmentLabel(s)}`,
  })),
]

function hasAccreditation(source: Record<string, unknown>, field: string): boolean {
  const v = source[field]
  return v === true || (Array.isArray(v) && v[0] === true)
}

function groupCitiesByLetter(cities: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const city of cities) {
    const letter = city[0]?.toUpperCase() ?? '#'
    if (!map.has(letter)) map.set(letter, [])
    map.get(letter)!.push(city)
  }
  return map
}

export default function HtmlSitemapPage() {
  const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
  const practitionersRaw: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json')
  const products: Array<{ brand?: string; category?: string }> = readJsonFileSync('products_processed_new.json')

  const clinicIndex = new Map(clinicsData.filter(c => c.slug).map(c => [c.slug!, c]))

  const practitioners = practitionersRaw.map(p => {
    try {
      const slug = JSON.parse(p.Associated_Clinics!)[0]
      const clinic = clinicIndex.get(slug)
      if (!clinic || !clinic.City?.trim()) return null
      return clinic
    } catch {
      return null
    }
  }).filter((c): c is Clinic => c !== null)

  const clinicCities = [...new Set(clinicsData.filter(c => c.City).map(c => c.City!))].sort()
  const practCities = [...new Set(practitioners.map(c => c.City!))].sort()

  const clinicCitiesByLetter = groupCitiesByLetter(clinicCities)
  const practCitiesByLetter = groupCitiesByLetter(practCities)
  const clinicLetters = [...clinicCitiesByLetter.keys()].sort()
  const practLetters = [...practCitiesByLetter.keys()].sort()

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort() as string[]
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort() as string[]

  const brandsByLetter = new Map<string, string[]>()
  for (const brand of brands) {
    const letter = brand[0]?.toUpperCase() ?? '#'
    if (!brandsByLetter.has(letter)) brandsByLetter.set(letter, [])
    brandsByLetter.get(letter)!.push(brand)
  }
  const brandLetters = [...brandsByLetter.keys()].sort()

  const b2bCityGroups = getB2bCitySitemapGroups()
  const b2bCityGroupByName = new Map(b2bCityGroups.map((g) => [g.city, g]))
  const b2bCityNames = b2bCityGroups.map((g) => g.city)
  const b2bCitiesByLetter = groupCitiesByLetter(b2bCityNames)
  const b2bCityLetters = [...b2bCitiesByLetter.keys()].sort()
  const { cityCount: b2bCityCount, cityPageCount: b2bCityPageCount, treatmentPageCount: b2bTreatmentPageCount } =
    countB2bScaledSitemapPages()
  const b2bTreatmentLinks = getB2bTreatmentSitemapLinks()
  const b2bTreatmentByLetter = new Map<string, typeof b2bTreatmentLinks>()
  for (const link of b2bTreatmentLinks) {
    const letter = link.label[0]?.toUpperCase() ?? '#'
    if (!b2bTreatmentByLetter.has(letter)) b2bTreatmentByLetter.set(letter, [])
    b2bTreatmentByLetter.get(letter)!.push(link)
  }
  const b2bTreatmentLetters = [...b2bTreatmentByLetter.keys()].sort()
  const b2bExpansionCounts = countB2bExpansionSitemapPages()
  const b2bExpansionGroups = getB2bExpansionSitemapGroups(24)
  const b2bTemplateExpansionSample = getB2bTemplateExpansionSampleLinks(48)
  const b2cCounts = countB2cSitemapPages()

  return (
    <main className="bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">HTML Sitemap</h1>
        <p className="text-sm text-muted-foreground mb-10">
          A complete index of all sections and pages on the Healthcare Directory.
        </p>

        <SitemapSection title="Site Pages">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ['/', 'Home'],
              ['/clinics', 'All Clinics'],
              ['/practitioners', 'All Practitioners'],
              ['/search', 'Search'],
              ['/treatments', 'Treatments'],
              ['/products', 'Products'],
              ['/products/brands', 'Product Brands'],
              ['/products/category', 'Product Categories'],
              ['/accredited', 'Accredited Providers'],
              ['/clinics/treatment-by-city/', 'Top Clinics by Treatment & City'],
              ['/practitioners/treatment-by-city/', 'Top Practitioners by Treatment & City'],
              ['/practitioners/credentials', 'Practitioner Credentials'],
              ['/business/', 'B2B Software Buyer Hub'],
              ['/register/clinic', 'Join Directory (Register a Clinic)'],
              ['/register/practitioner', 'Update Profile (Register as a Practitioner)'],
              ['/sitemap', 'HTML Sitemap'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-black hover:underline">{label}</Link>
              </li>
            ))}
          </ul>
        </SitemapSection>

        <SitemapSection title="XML Sitemaps (machine-readable)">
          <p className="text-sm text-muted-foreground mb-4">
            Directory feeds are referenced from the{' '}
            <Link href="/sitemap.xml" className="text-black hover:underline font-mono text-xs">sitemap.xml</Link>
            {' '}index. The B2B buyer hub uses a separate index (below) with canonical page URLs under{' '}
            <span className="font-mono text-xs">/business/</span>.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {XML_SITEMAPS.map(({ file, label }) => (
              <li key={file} className="flex items-baseline gap-2">
                <Link href={`/${file}`} className="text-sm text-black hover:underline">{label}</Link>
                <span className="text-xs text-gray-400 font-mono">{file}</span>
              </li>
            ))}
          </ul>
        </SitemapSection>

        <SitemapSection title="XML Sitemaps — B2B buyer hub">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {B2B_XML_SITEMAPS.map(({ file, label }) => (
              <li key={file} className="flex items-baseline gap-2">
                <Link href={`/${file}`} className="text-sm text-black hover:underline">{label}</Link>
                <span className="text-xs text-gray-400 font-mono">{file}</span>
              </li>
            ))}
          </ul>
        </SitemapSection>

        <SitemapSection title="B2B Software Buyer Hub — HTML pages">
          <p className="text-sm text-muted-foreground mb-6">
            Canonical hub URLs use <span className="font-mono text-xs">/business/</span> (separate from the B2C directory).
            Every buyer-hub page is listed below, including city-localized and treatment workflow URLs.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {[
              ['/business/', 'Buyer hub home'],
              ['/business/uk/', 'By city index'],
              ['/business/treatments/', 'Treatment workflows index'],
              ['/business/templates/', 'Template library'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-black hover:underline">{label}</Link>
              </li>
            ))}
          </ul>
          {HUB_SEGMENTS.filter((s) => s !== 'templates').map((segment) => {
            const entries = HUB_ENTRIES_BY_SEGMENT[segment] ?? []
            return (
              <SubSection
                key={segment}
                title={`${segmentLabel(segment)} (${entries.length + 1} pages)`}
              >
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-3">
                  <li>
                    <Link
                      href={hubSegmentCollectionHref(segment)}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      {segmentLabel(segment)} — index
                    </Link>
                  </li>
                  {entries.map((entry) => (
                    <li key={`${entry.segment}-${entry.slug}`}>
                      <Link
                        href={`/business/${entry.segment}/${entry.slug}/`}
                        className="text-sm text-black hover:underline"
                      >
                        {entry.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </SubSection>
            )
          })}
          <SubSection
            title={`B2B Hub — Localized pages by city (${b2bCityCount} cities, ${b2bCityPageCount} pages)`}
          >
            <AlphabetNav letters={b2bCityLetters} prefix="bh-" />
            {b2bCityLetters.map((letter) => (
              <div key={letter} id={`bh-${letter}`} className="mb-6 scroll-mt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 border-b border-gray-100 pb-0.5">
                  {letter}
                </h4>
                <div className="space-y-4">
                  {(b2bCitiesByLetter.get(letter) ?? []).map((city) => {
                    const group = b2bCityGroupByName.get(city)
                    if (!group) return null
                    return (
                      <div key={city}>
                        <p className="text-sm font-medium text-gray-800 mb-1.5">{city}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pl-3 border-l-2 border-gray-200">
                          {group.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="text-xs text-black hover:underline"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </SubSection>
          <SubSection title={`B2B Hub — Treatment workflows (${b2bTreatmentPageCount} pages)`}>
            <AlphabetNav letters={b2bTreatmentLetters} prefix="bt-" />
            {b2bTreatmentLetters.map((letter) => (
              <div key={letter} id={`bt-${letter}`} className="mb-5 scroll-mt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2 border-b border-gray-100 pb-0.5">
                  {letter}
                </h4>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {(b2bTreatmentByLetter.get(letter) ?? []).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-black hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </SubSection>
          <SubSection
            title={`Templates (${TEMPLATE_ENTRIES.length + 1 + (Object.keys(TEMPLATE_CATEGORY_LABEL) as TemplateCategory[]).length} pages)`}
          >
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-6">
              <li>
                <Link href="/business/templates/" className="text-sm font-medium text-black hover:underline">
                  Template library — index
                </Link>
              </li>
              {(Object.keys(TEMPLATE_CATEGORY_LABEL) as TemplateCategory[]).map((category) => (
                <li key={category}>
                  <Link
                    href={`/business/templates/${category}/`}
                    className="text-sm text-black hover:underline"
                  >
                    {TEMPLATE_CATEGORY_LABEL[category]}
                  </Link>
                </li>
              ))}
            </ul>
            {(Object.keys(TEMPLATE_CATEGORY_LABEL) as TemplateCategory[]).map((category) => {
              const entries = TEMPLATE_ENTRIES.filter((e) => e.category === category)
              if (entries.length === 0) return null
              return (
                <div key={category} className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {TEMPLATE_CATEGORY_LABEL[category]} ({entries.length})
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {entries.map((entry) => (
                      <Link
                        key={`${entry.category}-${entry.slug}`}
                        href={`/business/templates/${entry.category}/${entry.slug}/`}
                        className="text-xs text-black hover:underline"
                      >
                        {entry.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </SubSection>
          <SubSection
            title={`B2B expansion — segment × city (${b2bExpansionCounts.segmentCityCount} pages, sample below)`}
          >
            <p className="text-sm text-muted-foreground mb-4">
              PDF expansion URLs such as{' '}
              <span className="font-mono text-xs">/business/consent/botox-consent-form-software/london/</span>.
              Full list split across{' '}
              <Link href="/business-expansion-city1.xml" className="text-black hover:underline font-mono text-xs">
                business-expansion-city1.xml
              </Link>
              –{' '}
              <Link href="/business-expansion-city4.xml" className="text-black hover:underline font-mono text-xs">
                city4.xml
              </Link>{' '}
              (~40k URLs each; legacy{' '}
              <Link href="/business-expansion-city.xml" className="text-black hover:underline font-mono text-xs">
                business-expansion-city.xml
              </Link>{' '}
              indexes the chunks).
            </p>
            {b2bExpansionGroups.map((group) => (
              <div key={group.segment} className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">{group.segmentLabel}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs text-black hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </SubSection>
          <SubSection
            title={`B2B expansion — templates × city (${b2bExpansionCounts.templateCityCount} pages, sample below)`}
          >
            <p className="text-sm text-muted-foreground mb-4">
              Pattern:{' '}
              <span className="font-mono text-xs">/business/templates/botox-consent-form-template/london/</span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {b2bTemplateExpansionSample.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-black hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SubSection>
        </SitemapSection>

        <SitemapSection title={`B2C directory hub pages (${b2cCounts.hubStyleTotal.toLocaleString()} pages)`}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <li className="text-sm">Treatment × City: <strong>{b2cCounts.treatmentCityHub.toLocaleString()}</strong></li>
            <li className="text-sm">Best-in-city: <strong>{b2cCounts.bestInCity.toLocaleString()}</strong></li>
            <li className="text-sm">Standalone national: <strong>{b2cCounts.standaloneTotal.toLocaleString()}</strong></li>
            <li className="text-sm pl-4 text-muted-foreground">↳ Treatment × Product: {b2cCounts.treatmentProduct.toLocaleString()}</li>
            <li className="text-sm pl-4 text-muted-foreground">↳ Treatment standalone: {b2cCounts.standaloneTreatment.toLocaleString()}</li>
            <li className="text-sm pl-4 text-muted-foreground">↳ Product category: {b2cCounts.standaloneProductCategory.toLocaleString()}</li>
            <li className="text-sm">Service × City: <strong>{b2cCounts.serviceCity.toLocaleString()}</strong></li>
          </ul>
        </SitemapSection>

        <SitemapSection title="Database URLs">
          <p className="text-sm text-muted-foreground mb-8">
            All listing pages, grouped by category. These pages index individual clinic, practitioner, treatment, and product profiles.
          </p>

          {/* Clinics by City */}
          <SubSection title={`Clinics by City (${clinicCities.length} cities)`}>
            <AlphabetNav letters={clinicLetters} prefix="cc-" />
            {clinicLetters.map(letter => (
              <div key={letter} id={`cc-${letter}`} className="mb-5 scroll-mt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2 border-b border-gray-100 pb-0.5">{letter}</h4>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {(clinicCitiesByLetter.get(letter) ?? []).map(city => (
                    <Link
                      key={city}
                      href={`/clinics/${toUrlSlug(city)}`}
                      className="text-sm text-black hover:underline"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </SubSection>

          {/* Practitioners by City */}
          <SubSection title={`Practitioners by City (${practCities.length} cities)`}>
            <AlphabetNav letters={practLetters} prefix="pc-" />
            {practLetters.map(letter => (
              <div key={letter} id={`pc-${letter}`} className="mb-5 scroll-mt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2 border-b border-gray-100 pb-0.5">{letter}</h4>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {(practCitiesByLetter.get(letter) ?? []).map(city => (
                    <Link
                      key={city}
                      href={`/practitioners/${toUrlSlug(city)}`}
                      className="text-sm text-black hover:underline"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </SubSection>

          {/* Treatments */}
          <SubSection title={`Treatments (${modalities.length})`}>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {modalities.map(t => (
                <Link key={t} href={`/treatments/${toUrlSlug(t)}`} className="text-sm text-black hover:underline">
                  {t}
                </Link>
              ))}
            </div>
          </SubSection>

          {/* Accredited */}
          <SubSection title="Accredited Providers by Body">
            <div className="space-y-6">
              {ACCREDITATIONS.map(({ key, name, field }) => {
                const accClinicCities = [...new Set(
                  clinicsData
                    .filter(c => hasAccreditation(c as unknown as Record<string, unknown>, field) && c.City)
                    .map(c => c.City!)
                )].sort()
                const accPractCities = [...new Set(
                  practitioners
                    .filter(p => hasAccreditation(p as unknown as Record<string, unknown>, field) && p.City)
                    .map(p => p.City!)
                )].sort()
                return (
                  <div key={key}>
                    <p className="text-sm font-semibold text-gray-800 mb-2">{name}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3 border-l-2 border-gray-200">
                      <div>
                        <Link href={`/accredited/${key}/clinics`} className="text-sm text-black hover:underline font-medium block mb-1.5">
                          Clinics ({accClinicCities.length} cities)
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {accClinicCities.map(city => (
                            <Link key={city} href={`/accredited/${key}/clinics/${toUrlSlug(city)}`} className="text-xs text-black hover:underline">
                              {city}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Link href={`/accredited/${key}/practitioners`} className="text-sm text-black hover:underline font-medium block mb-1.5">
                          Practitioners ({accPractCities.length} cities)
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {accPractCities.map(city => (
                            <Link key={city} href={`/accredited/${key}/practitioners/${toUrlSlug(city)}`} className="text-xs text-black hover:underline">
                              {city}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </SubSection>

          {/* Products */}
          <SubSection title={`Products — ${categories.length} categories, ${brands.length} brands`}>
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {categories.map(cat => (
                  <Link key={cat} href={`/products/category/${toUrlSlug(cat)}`} className="text-sm text-black hover:underline">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Brands A–Z</p>
              <AlphabetNav letters={brandLetters} prefix="br-" />
              {brandLetters.map(letter => (
                <div key={letter} id={`br-${letter}`} className="mb-4 scroll-mt-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{letter}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(brandsByLetter.get(letter) ?? []).map(brand => (
                      <Link key={brand} href={`/products/brands/${toUrlSlug(brand)}`} className="text-xs text-black hover:underline">
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
        </SitemapSection>
      </div>
    </main>
  )
}

function SitemapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="text-xl font-bold text-gray-900 mb-5 pb-2 border-b-2 border-gray-300">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function AlphabetNav({ letters, prefix }: { letters: string[]; prefix: string }) {
  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {letters.map(letter => (
        <a key={letter} href={`#${prefix}${letter}`} className="px-2 py-0.5 text-xs font-mono bg-gray-100 rounded hover:bg-gray-200 text-gray-700">
          {letter}
        </a>
      ))}
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Sitemap - Healthcare Directory',
    description: 'Complete HTML sitemap of the Healthcare Directory — browse all clinics, practitioners, treatments, products, and accredited providers.',
    alternates: {
      canonical: toDirectoryCanonical('/sitemap'),
    },
  }
}
