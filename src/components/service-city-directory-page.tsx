import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import ItemsGrid from '@/components/collectionGrid'
import { BestRankedBlock } from '@/components/best-ranked-block'
import { DirectoryPageClosingSections } from '@/components/directory-page-closing-sections'
import { DirectoryPatientHubHero } from '@/components/directory-patient-hub-hero'
import { ServiceCityBelowFoldContent } from '@/components/service-city-below-fold-content'
import { DirectoryJsonLd } from '@/components/directory-json-ld'
import { buildClinicRankedEntries } from '@/lib/best-ranked'
import { getClinicDisplayName } from '@/lib/clinic-display'
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
  buildServiceJsonLd,
  clinicItemListFromClinics,
} from '@/lib/directory-json-ld'
import {
  buildServiceCityConsumerContent,
  getServiceCityConsumerStats,
} from '@/lib/service-city-consumer-content'
import {
  getServiceCityClinics,
  getServiceCityEntries,
  type ServiceCityEntry,
} from '@/lib/directory-seo-pages'
import { IconArrowNarrowLeft } from '@tabler/icons-react'

type Props = {
  entry: ServiceCityEntry
}

export function ServiceCityDirectoryPage({ entry }: Props) {
  const clinics = getServiceCityClinics(entry.serviceSlug, entry.locationSlug)
  const ranked = buildClinicRankedEntries(clinics, 6)
  const consumerStats = getServiceCityConsumerStats(
    clinics,
    entry.serviceSlug,
    entry.locationSlug
  )
  const consumerContent = buildServiceCityConsumerContent(
    entry.serviceLabel,
    entry.locationLabel,
    consumerStats
  )

  const pagePath = `/${entry.serviceSlug}/${entry.locationSlug}`
  const listItems = clinicItemListFromClinics(clinics, (clinic) =>
    getClinicDisplayName({ slug: clinic.slug, url: clinic.url })
  )
  const jsonLdSchemas = [
    buildBreadcrumbListJsonLd([
      { name: 'Home', path: '/' },
      { name: entry.serviceLabel, path: pagePath },
      { name: entry.locationLabel, path: pagePath },
    ]),
    buildServiceJsonLd({
      name: `${entry.serviceLabel} in ${entry.locationLabel}`,
      description: `Browse verified ${entry.serviceLabel.toLowerCase()} listings in ${entry.locationLabel}.`,
      areaServed: entry.locationLabel,
      path: pagePath,
    }),
    buildItemListJsonLd(`${entry.serviceLabel} in ${entry.locationLabel}`, listItems),
    buildFaqPageJsonLd(consumerContent.faqItems),
  ]

  const relatedServiceLinks = getServiceCityEntries()
    .filter(
      (candidate) =>
        candidate.locationSlug === entry.locationSlug &&
        candidate.serviceSlug !== entry.serviceSlug
    )
    .slice(0, 12)

  const practitionersCityPath = `/practitioners/${entry.locationSlug}`
  const clinicsCityPath = `/clinics/${entry.locationSlug}`

  return (
    <>
      <DirectoryJsonLd schemas={jsonLdSchemas} />
      <main>
        <div className="flex min-h-[calc(100vh-76px)] flex-col bg-[var(--primary-bg-color)]">
          <div className="mx-auto w-full max-w-7xl px-6 pt-6">
            <Link
              href="/"
              prefetch={false}
              className="mb-4 inline-flex items-center gap-3 text-sm hover:underline"
            >
              <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
              Back to Directory
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{entry.serviceLabel}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{entry.locationLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <DirectoryPatientHubHero
            title={`${entry.serviceLabel} in ${entry.locationLabel}`}
            subtitle={`Browse ${entry.clinicCount} verified ${entry.serviceLabel.toLowerCase()} listings in ${entry.locationLabel}. Compare reviews, services and clinic profiles in one place.`}
          />
        </div>

        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 pb-6">
            <BestRankedBlock
              title={`Top ${entry.serviceLabel} in ${entry.locationLabel}`}
              entries={ranked}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-12">
            <ItemsGrid items={clinics} />
          </div>

          <ServiceCityBelowFoldContent content={consumerContent} />

          <div className="mx-auto max-w-7xl px-4 pb-12">
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={practitionersCityPath}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Practitioners in {entry.locationLabel}
              </Link>
              <Link
                href={clinicsCityPath}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Clinics in {entry.locationLabel}
              </Link>
            </div>
            {relatedServiceLinks.length > 0 ? (
              <nav
                className="mt-6"
                aria-label={`Other clinic categories in ${entry.locationLabel}`}
              >
                <p className="text-sm font-semibold text-foreground">
                  Browse other categories in {entry.locationLabel}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {relatedServiceLinks.map((link) => (
                    <li key={`${link.serviceSlug}-${link.locationSlug}`}>
                      <Link
                        href={`/${link.serviceSlug}/${link.locationSlug}/`}
                        className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        {link.serviceLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          <DirectoryPageClosingSections />
        </div>
      </main>
    </>
  )
}
