import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { HubIndexSearchCards } from '@/components/b2b-hub/hub-index-search-cards'
import { BestRankedBlock } from '@/components/best-ranked-block'
import { CityPricingContext } from '@/components/city-pricing-context'
import { DirectoryPageClosingSections } from '@/components/directory-page-closing-sections'
import { DirectoryJsonLd } from '@/components/directory-json-ld'
import { ServiceCityBelowFoldContent } from '@/components/service-city-below-fold-content'
import { buildClinicRankedEntries } from '@/lib/best-ranked'
import { buildCityTreatmentPriceInsights } from '@/lib/city-pricing'
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
  buildServiceJsonLd,
  buildMedicalClinicListJsonLd,
  clinicItemListFromClinics,
} from '@/lib/directory-json-ld'
import { buildBestInCitySlug, getBestInCityEntry } from '@/lib/best-in-city-pages'
import { getClinicDisplayName } from '@/lib/clinic-display'
import {
  buildTreatmentCityConsumerContent,
  getTreatmentCityConsumerStats,
} from '@/lib/treatment-city-consumer-content'
import {
  getTreatmentCityHubClinics,
  treatmentHubStandaloneSlug,
  type TreatmentCityHubEntry,
} from '@/lib/treatment-city-hub'
import { toUrlSlug } from '@/lib/utils'

type Props = {
  entry: TreatmentCityHubEntry
}

export function TreatmentCityHubPage({ entry }: Props) {
  const pagePath = `/${entry.treatmentSlug}/${entry.locationSlug}`
  const practitionersPath = `/practitioners/${entry.locationSlug}/treatments/${entry.treatmentSlug}/`
  const clinicsPath = `/clinics/${entry.locationSlug}/services/${entry.treatmentSlug}/`
  const standalonePath = `/${treatmentHubStandaloneSlug(entry.treatmentSlug)}/`
  const nationalTreatmentPath = `/treatments/${entry.treatmentSlug}/`

  const clinics = getTreatmentCityHubClinics(entry.treatmentSlug, entry.locationSlug)
  const ranked = buildClinicRankedEntries(clinics, 4, {
    treatmentSlug: entry.treatmentSlug,
    treatmentName: entry.treatmentName,
  })
  const priceInsights = buildCityTreatmentPriceInsights(clinics, entry.locationLabel, 1).filter(
    (insight) =>
      toUrlSlug(insight.treatment) === entry.treatmentSlug ||
      insight.treatment.toLowerCase().includes(entry.treatmentName.toLowerCase().slice(0, 5))
  )
  const consumerStats = getTreatmentCityConsumerStats(
    clinics,
    entry.treatmentSlug,
    entry.locationSlug
  )
  const consumerContent = buildTreatmentCityConsumerContent(
    entry.treatmentName,
    entry.locationLabel,
    consumerStats
  )
  const listItems = clinicItemListFromClinics(clinics, (clinic) =>
    getClinicDisplayName({ slug: clinic.slug, url: clinic.url })
  )

  const serviceName = `${entry.treatmentName} in ${entry.locationLabel}`
  const serviceDescription = `Compare ${entry.treatmentName} clinics and practitioners in ${entry.locationLabel}. Explore verified listings, local pricing context, and booking options.`

  const jsonLdSchemas = [
    buildBreadcrumbListJsonLd([
      { name: 'Home', path: '/' },
      { name: entry.treatmentName, path: standalonePath },
      { name: entry.locationLabel, path: pagePath },
    ]),
    buildServiceJsonLd({
      name: serviceName,
      description: serviceDescription,
      areaServed: entry.locationLabel,
      path: pagePath,
    }),
    buildItemListJsonLd(serviceName, listItems),
    buildFaqPageJsonLd(consumerContent.faqItems),
    ...buildMedicalClinicListJsonLd(clinics, (clinic) =>
      getClinicDisplayName({ slug: clinic.slug, url: clinic.url })
    ),
  ]

  const bestInCitySlug = buildBestInCitySlug(entry.treatmentSlug, entry.locationSlug)
  const bestInCityEntry = getBestInCityEntry(bestInCitySlug)

  const corridorCards = [
    {
      key: 'practitioners',
      href: practitionersPath,
      title: `${entry.treatmentName} practitioners in ${entry.locationLabel}`,
      subtitle: `${entry.practitionerCount} practitioner listing${entry.practitionerCount === 1 ? '' : 's'} with profiles, reviews, and booking paths.`,
    },
    {
      key: 'clinics',
      href: clinicsPath,
      title: `${entry.treatmentName} clinics in ${entry.locationLabel}`,
      subtitle: `${entry.clinicCount} clinic listing${entry.clinicCount === 1 ? '' : 's'} with services, fees, and patient reviews.`,
    },
  ]

  return (
    <>
      <DirectoryJsonLd schemas={jsonLdSchemas} />
      <main>
        <div className="bg-[var(--primary-bg-color)]">
          <div className="mx-auto max-w-7xl px-4 pt-6">
            <Link href="/" prefetch={false} className="mb-2 inline-block">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white hover:text-black">
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={nationalTreatmentPath}>{entry.treatmentName}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{entry.locationLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <HubIndexSearchCards
            heroTitle={`${entry.treatmentName} in ${entry.locationLabel}`}
            heroSubtitle={`Your starting point for ${entry.treatmentName.toLowerCase()} in ${entry.locationLabel}. Choose practitioners or clinics below, then compare verified profiles before you book.`}
            searchPlaceholder={`Search ${entry.treatmentName} options`}
            entries={corridorCards}
            heroInputId={`treatment-hub-search-${entry.treatmentSlug}-${entry.locationSlug}`}
          />
        </div>

        <div className="bg-white">
          <ServiceCityBelowFoldContent content={consumerContent} />

          {ranked.length > 0 ? (
            <div className="mx-auto max-w-7xl px-4 pb-6">
              <BestRankedBlock
                title={`Featured ${entry.treatmentName} clinics in ${entry.locationLabel}`}
                entries={ranked}
              />
            </div>
          ) : null}

          {priceInsights.length > 0 ? (
            <div className="mx-auto max-w-7xl px-4 pb-6">
              <CityPricingContext city={entry.locationLabel} insights={priceInsights} />
            </div>
          ) : null}

          <div className="mx-auto max-w-6xl px-4 pb-12">
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={standalonePath}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                UK-wide {entry.treatmentName} guide
              </Link>
              <Link
                href={`/practitioners/${entry.locationSlug}/`}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                All practitioners in {entry.locationLabel}
              </Link>
              <Link
                href={`/clinics/${entry.locationSlug}/`}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                All clinics in {entry.locationLabel}
              </Link>
              {bestInCityEntry ? (
                <Link
                  href={`/${bestInCityEntry.slug}/`}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Best {entry.treatmentName} clinics in {entry.locationLabel}
                </Link>
              ) : null}
            </div>
          </div>

          <DirectoryPageClosingSections />
        </div>
      </main>
    </>
  )
}
