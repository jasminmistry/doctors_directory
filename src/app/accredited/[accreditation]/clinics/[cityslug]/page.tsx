import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Clinic } from "@/lib/types"
import { IconArrowNarrowLeft } from "@tabler/icons-react"
import { readJsonFileSync } from "@/lib/json-cache"
import { PractitionerCard } from "@/components/practitioner-card"
import { isAllowedCqcAccreditedCity } from "@/lib/accredited-city-filter"
import { toDirectoryCanonical } from "@/lib/seo"
import { notFound } from "next/navigation"
import {
  clinicCityMatchesSlug,
  clinicMatchesAccreditation,
  getAccreditationDisplayName,
  isKnownAccreditation,
  isPrestigeAccreditation,
  normalizeAccreditationSlug,
} from "@/lib/accreditation-directory"
import { applyPrestigeToClinic } from "@/lib/prestige-accreditations"
import { capitalize } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface AccreditedClinicsPageProps {
  params: {
    accreditation: string
    cityslug: string
  }
}

export default async function AccreditedClinicsPage({ params }: Readonly<AccreditedClinicsPageProps>) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  const cityslug = decodeURIComponent(params.cityslug)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }
  if (accreditation === "cqc" && !isAllowedCqcAccreditedCity(cityslug)) {
    notFound()
  }

  const clinics: Clinic[] = readJsonFileSync("clinics_processed_new_data.json").map(
    (clinic: Clinic) => applyPrestigeToClinic(clinic),
  )

  const filteredClinics = clinics.filter((clinic) => {
    return (
      clinicCityMatchesSlug(clinic.City, cityslug) &&
      clinicMatchesAccreditation(clinic, accreditation)
    )
  })

  if (isPrestigeAccreditation(accreditation) && filteredClinics.length === 0) {
    notFound()
  }

  const cityClinics = clinics.filter((c) => clinicCityMatchesSlug(c.City, cityslug))
  const displayClinics = filteredClinics.length ? filteredClinics : cityClinics
  const isFallback = filteredClinics.length === 0
  const accreditationName = getAccreditationDisplayName(accreditation)
  const cityDisplayName = capitalize(cityslug)

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12">
        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0 md:pt-0 md:border-0 border-b border-[#C4C4C4]">
          <div className="sticky top-0 z-10">
            <Link className="mb-4 inline-flex items-center gap-3 text-sm hover:underline" href="/" prefetch={false}>
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
                  <BreadcrumbLink href="/accredited">
                    Accredited Clinics & Practitioners
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/accredited/${accreditation}/clinics`}>
                    {accreditationName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{cityDisplayName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            {accreditationName} Clinics in {cityDisplayName}
          </h1>
          {isFallback && (
            <p className="text-sm text-amber-700 mb-4">
              No exact {accreditationName} matches in this city yet. Showing other clinics in {cityDisplayName}.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
          {displayClinics.map((clinic) => (
            <PractitionerCard key={clinic.slug} practitioner={clinic} />
          ))}
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: AccreditedClinicsPageProps) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  const cityslug = decodeURIComponent(params.cityslug)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }
  if (accreditation === "cqc" && !isAllowedCqcAccreditedCity(cityslug)) {
    notFound()
  }
  const accreditationName = getAccreditationDisplayName(accreditation)

  return {
    title: `Accredited ${accreditationName} Clinics in ${cityslug}`,
    description: `Find ${accreditationName} accredited clinics in ${cityslug}. Compare ratings, reviews, and book appointments with verified healthcare providers.`,
    alternates: {
      canonical: toDirectoryCanonical(
        `/accredited/${accreditation}/clinics/${cityslug.toLowerCase()}`,
      ),
    },
    openGraph: {
      title: `Accredited ${accreditationName} Clinics in ${cityslug}`,
      description: `Find ${accreditationName} accredited clinics in ${cityslug}. Compare ratings and reviews.`,
    },
  }
}
