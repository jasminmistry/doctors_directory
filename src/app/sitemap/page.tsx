import Link from 'next/link'
import type { Clinic, Practitioner } from '@/lib/types'
import { readJsonFileSync } from '@/lib/json-cache'
import { toUrlSlug } from '@/lib/utils'
import { toDirectoryCanonical } from '@/lib/seo'
import { modalities } from '@/lib/data'

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

  return (
    <main className="bg-(--primary-bg-color) min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">HTML Sitemap</h1>
        <p className="text-sm text-muted-foreground mb-10">
          A complete index of all sections and pages on the Healthcare Directory.
        </p>

        {/* ── Site Pages ─────────────────────────────────────── */}
        <SitemapSection title="Site Pages">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ['/directory', 'Home'],
              ['/directory/clinics', 'All Clinics'],
              ['/directory/practitioners', 'All Practitioners'],
              ['/directory/search', 'Search'],
              ['/directory/treatments', 'Treatments'],
              ['/directory/products', 'Products'],
              ['/directory/products/brands', 'Product Brands'],
              ['/directory/products/category', 'Product Categories'],
              ['/directory/accredited', 'Accredited Providers'],
              ['/directory/practitioners/credentials', 'Practitioner Credentials'],
              ['/directory/sitemap', 'HTML Sitemap'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-blue-700 hover:underline">{label}</Link>
              </li>
            ))}
          </ul>
        </SitemapSection>

        {/* ── XML Sitemaps ───────────────────────────────────── */}
        <SitemapSection title="XML Sitemaps (machine-readable)">
          <p className="text-sm text-muted-foreground mb-4">
            These feeds are consumed by search engines. All feeds are referenced from the{' '}
            <Link href="/directory/sitemap.xml" className="text-blue-700 hover:underline font-mono text-xs">sitemap.xml</Link>
            {' '}index.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {XML_SITEMAPS.map(({ file, label }) => (
              <li key={file} className="flex items-baseline gap-2">
                <Link href={`/directory/${file}`} className="text-sm text-blue-700 hover:underline">{label}</Link>
                <span className="text-xs text-gray-400 font-mono">{file}</span>
              </li>
            ))}
          </ul>
        </SitemapSection>

        {/* ── Database URLs ──────────────────────────────────── */}
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
                      className="text-sm text-blue-700 hover:underline"
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
                      className="text-sm text-blue-700 hover:underline"
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
                <Link key={t} href={`/treatments/${toUrlSlug(t)}`} className="text-sm text-blue-700 hover:underline">
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
                        <Link href={`/accredited/${key}/clinics`} className="text-sm text-blue-700 hover:underline font-medium block mb-1.5">
                          Clinics ({accClinicCities.length} cities)
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {accClinicCities.map(city => (
                            <Link key={city} href={`/accredited/${key}/clinics/${toUrlSlug(city)}`} className="text-xs text-blue-600 hover:underline">
                              {city}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Link href={`/accredited/${key}/practitioners`} className="text-sm text-blue-700 hover:underline font-medium block mb-1.5">
                          Practitioners ({accPractCities.length} cities)
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {accPractCities.map(city => (
                            <Link key={city} href={`/accredited/${key}/practitioners/${toUrlSlug(city)}`} className="text-xs text-blue-600 hover:underline">
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
                  <Link key={cat} href={`/products/category/${toUrlSlug(cat)}`} className="text-sm text-blue-700 hover:underline">
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
                      <Link key={brand} href={`/products/brands/${toUrlSlug(brand)}`} className="text-xs text-blue-600 hover:underline">
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
