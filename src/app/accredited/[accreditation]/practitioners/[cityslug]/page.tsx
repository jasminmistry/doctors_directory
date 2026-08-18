import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getAllPractitionersForSearch } from "@/lib/data-access/practitioners"
import { PractitionerCard } from "@/components/practitioner-card"
import { toDirectoryCanonical } from "@/lib/seo"
import { notFound } from "next/navigation"
import {
  clinicCityMatchesSlug,
  getAccreditationDisplayName,
  getAccreditedPractitioners,
  isKnownAccreditation,
  isPrestigeAccreditation,
  normalizeAccreditationSlug,
  practitionerMatchesAccreditation,
} from "@/lib/accreditation-directory"
import { getPractitionerDirectoryRobots } from "@/lib/practitioner-profile-robots"
import { capitalize } from "@/lib/utils"
import { IconArrowNarrowLeft } from "@tabler/icons-react"

export const dynamic = "force-dynamic"

interface AccreditedPractitionersPageProps {
  params: {
    accreditation: string
    cityslug: string
  }
}

export default async function AccreditedPractitionersPage({
  params,
}: Readonly<AccreditedPractitionersPageProps>) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  const cityslug = decodeURIComponent(params.cityslug)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }

  const enrichedPractitioners = isPrestigeAccreditation(accreditation)
    ? getAccreditedPractitioners(accreditation)
    : await getAllPractitionersForSearch()
  const filteredPractitioners = enrichedPractitioners.filter((practitioner) => {
    if (!practitioner) return false
    return (
      clinicCityMatchesSlug(practitioner.City, cityslug) &&
      practitionerMatchesAccreditation(practitioner, accreditation)
    )
  })

  if (isPrestigeAccreditation(accreditation) && filteredPractitioners.length === 0) {
    notFound()
  }

  const cityPractitioners = enrichedPractitioners.filter((p) =>
    clinicCityMatchesSlug(p?.City, cityslug),
  )
  const displayPractitioners = filteredPractitioners.length
    ? filteredPractitioners
    : cityPractitioners
  const isFallback = filteredPractitioners.length === 0
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
                  <BreadcrumbLink href={`/accredited/${accreditation}/practitioners`}>
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
            {accreditationName} Practitioners in {cityDisplayName}
          </h1>
          {isFallback && (
            <p className="text-sm text-amber-700 mb-4">
              No exact {accreditationName} matches in this city yet. Showing other practitioners in {cityDisplayName}.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
          {displayPractitioners.map((practitioner) => (
            <PractitionerCard key={practitioner!.slug} practitioner={practitioner!} />
          ))}
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: AccreditedPractitionersPageProps) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  const cityslug = decodeURIComponent(params.cityslug)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }
  const accreditationName = getAccreditationDisplayName(accreditation)
  const robots = getPractitionerDirectoryRobots()

  return {
    title: `Accredited ${accreditationName} Practitioners in ${cityslug}`,
    description: `Find ${accreditationName} accredited practitioners in ${cityslug}. Compare ratings, reviews, and book appointments.`,
    alternates: {
      canonical: toDirectoryCanonical(
        `/accredited/${accreditation}/practitioners/${cityslug.toLowerCase()}`,
      ),
    },
    openGraph: {
      title: `Accredited ${accreditationName} Practitioners in ${cityslug}`,
      description: `Find ${accreditationName} accredited practitioners in ${cityslug}. Compare ratings and reviews.`,
    },
    ...(robots ? { robots } : {}),
  }
}
