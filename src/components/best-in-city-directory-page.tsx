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
import { BestRankedBlock } from '@/components/best-ranked-block'
import { CityPricingContext } from '@/components/city-pricing-context'
import { DirectoryJsonLd } from '@/components/directory-json-ld'
import { ServiceCityBelowFoldContent } from '@/components/service-city-below-fold-content'
import { buildClinicRankedEntries } from '@/lib/best-ranked'
import { buildCityTreatmentPriceInsights } from '@/lib/city-pricing'
import type { BestInCityEntry } from '@/lib/best-in-city-pages'
import { getBestInCityClinics } from '@/lib/best-in-city-pages'
import { getClinicDisplayName } from '@/lib/clinic-display'
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
  buildMedicalClinicListJsonLd,
  clinicItemListFromClinics,
} from '@/lib/directory-json-ld'
import {
  buildTreatmentCityConsumerContent,
  getTreatmentCityConsumerStats,
} from '@/lib/treatment-city-consumer-content'

type Props = {
  entry: BestInCityEntry
}

export function BestInCityDirectoryPage({ entry }: Props) {
  const pagePath = `/${entry.slug}`
  const hubPath = `/${entry.treatmentSlug}/${entry.locationSlug}/`
  const clinicsPath = `/clinics/${entry.locationSlug}/services/${entry.treatmentSlug}/`
  const practitionersPath = `/practitioners/${entry.locationSlug}/treatments/${entry.treatmentSlug}/`

  const clinics = getBestInCityClinics(entry.treatmentSlug, entry.locationSlug)
  const ranked = buildClinicRankedEntries(clinics, 6, {
    treatmentSlug: entry.treatmentSlug,
    treatmentName: entry.treatmentName,
  })
  const priceInsights = buildCityTreatmentPriceInsights(clinics, entry.locationLabel, 1).filter(
    (insight) => insight.treatment.toLowerCase().includes(entry.treatmentName.toLowerCase().slice(0, 5))
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
    getClinicDisplayName({ slug: clinic.slug, url: clinic.url, name: clinic.name })
  )

  const jsonLdSchemas = [
    buildBreadcrumbListJsonLd([
      { name: 'Home', path: '/' },
      { name: entry.treatmentName, path: hubPath },
      { name: `Best in ${entry.locationLabel}`, path: pagePath },
    ]),
    buildItemListJsonLd(
      `Best ${entry.treatmentName} Clinics in ${entry.locationLabel}`,
      listItems
    ),
    buildFaqPageJsonLd(consumerContent.faqItems),
    ...buildMedicalClinicListJsonLd(clinics, (clinic) =>
      getClinicDisplayName({ slug: clinic.slug, url: clinic.url, name: clinic.name })
    ),
  ]

  return (
    <>
      <DirectoryJsonLd schemas={jsonLdSchemas} />
      <main className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <Link href="/" prefetch={false} className="mb-4 inline-flex items-center gap-3 text-sm hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
          </Link>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={hubPath}>
                  {entry.treatmentName} in {entry.locationLabel}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Best clinics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
            Best {entry.treatmentName} Clinics in {entry.locationLabel}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            Compare {entry.clinicCount} verified {entry.treatmentName.toLowerCase()} clinics in{' '}
            {entry.locationLabel}. Rankings use review volume, ratings, and profile completeness from
            the Consentz directory.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-6">
          <BestRankedBlock
            title={`Top ${entry.treatmentName} Clinics in ${entry.locationLabel}`}
            entries={ranked}
          />
        </div>

        {priceInsights.length > 0 ? (
          <div className="mx-auto max-w-7xl px-4 pb-6">
            <CityPricingContext
              city={entry.locationLabel}
              insights={priceInsights}
              variant="light"
            />
          </div>
        ) : null}

        <ServiceCityBelowFoldContent content={consumerContent} />

        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href={hubPath} className="text-foreground underline-offset-2 hover:underline">
              {entry.treatmentName} hub in {entry.locationLabel}
            </Link>
            <Link href={clinicsPath} className="text-foreground underline-offset-2 hover:underline">
              All clinic listings
            </Link>
            <Link
              href={practitionersPath}
              className="text-foreground underline-offset-2 hover:underline"
            >
              Practitioner listings
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
