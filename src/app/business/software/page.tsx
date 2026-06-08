import type { Metadata } from 'next'
import Link from 'next/link'
import {
  buildHubPageMetadata,
  hubSegmentIndexMetaTitle,
} from '@/lib/b2b-hub/hub-page-metadata'
import { UK_PRIORITY_CITIES } from '@/lib/b2b-hub/uk-hub-index-data'
import { P0_TREATMENT_CITY_HUB_CITIES } from '@/lib/treatment-hub-cities'
import { toUrlSlug } from '@/lib/utils'

const SOFTWARE_PAGE_SLUG = 'aesthetic-clinic-software'

export const metadata: Metadata = buildHubPageMetadata({
  title: hubSegmentIndexMetaTitle('software'),
  description:
    'Browse aesthetic clinic software guides by UK city. Local directory context plus consent, CQC, and booking workflows for clinic buyers.',
  canonicalPath: '/business/software/',
  ogType: 'website',
})

export default function BusinessSoftwareByCityPage() {
  const cities = [
    ...new Set([...UK_PRIORITY_CITIES, ...P0_TREATMENT_CITY_HUB_CITIES]),
  ].sort((left, right) => left.localeCompare(right))

  return (
    <main className="bg-white px-4 py-10 md:py-14 [font-family:Inter,system-ui,sans-serif]">
      <div className="mx-auto max-w-[1280px]">
        <nav className="mb-6 text-sm text-neutral-600">
          <Link href="/business/" className="hover:text-neutral-900">
            Buyer Hub
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">Aesthetic clinic software by city</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight text-[#111111] md:text-4xl">
          Aesthetic Clinic Software by City
        </h1>
        <p className="mt-4 max-w-3xl text-base text-neutral-600 md:text-lg">
          Open a city page for local clinic context, regulator-aware copy, and software buyer
          pathways. This index updates automatically as directory city coverage grows.
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cities.map((city) => {
            const citySlug = toUrlSlug(city)
            return (
              <li key={citySlug}>
                <Link
                  href={`/business/uk/${citySlug}/${SOFTWARE_PAGE_SLUG}/`}
                  className="flex min-h-[72px] flex-col justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 hover:border-neutral-400 hover:shadow-sm"
                >
                  <span className="font-semibold text-neutral-900">{city}</span>
                  <span className="mt-1 text-sm text-neutral-600">Aesthetic clinic software</span>
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="mt-10 text-sm text-neutral-600">
          <Link href="/business/uk/" className="font-medium text-neutral-900 underline-offset-2 hover:underline">
            View all buyer hub city pages
          </Link>
        </p>
      </div>
    </main>
  )
}
