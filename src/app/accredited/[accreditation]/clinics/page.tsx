import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SearchBar } from "@/components/search/search-bar"
import type { Clinic } from "@/lib/types"
import { readJsonFileSync } from "@/lib/json-cache"
import { filterCqcAccreditedCities } from "@/lib/accredited-city-filter"
import { toUrlSlug } from "@/lib/utils"
import { toDirectoryCanonical } from "@/lib/seo"
import {
  filterClinicsByAccreditation,
  getAccreditationDisplayName,
  isKnownAccreditation,
  normalizeAccreditationSlug,
} from "@/lib/accreditation-directory"
import { applyPrestigeToClinic } from "@/lib/prestige-accreditations"
import { prisma } from "@/lib/db"

function emptyClinic(partial: Partial<Clinic> & Pick<Clinic, "slug" | "City">): Clinic {
  return {
    slug: partial.slug,
    image: partial.image ?? "",
    url: partial.url,
    rating: partial.rating ?? 0,
    reviewCount: partial.reviewCount ?? 0,
    category: partial.category ?? "",
    gmapsAddress: partial.gmapsAddress ?? "",
    gmapsPhone: partial.gmapsPhone ?? "",
    City: partial.City,
    facebook: partial.facebook ?? "",
    twitter: partial.twitter ?? "",
    Linkedin: partial.Linkedin ?? "",
    instagram: partial.instagram ?? "",
    youtube: partial.youtube ?? "",
    website: partial.website ?? "",
    email: partial.email ?? "",
    isSaveFace: partial.isSaveFace ?? false,
    isDoctor: partial.isDoctor ?? false,
    isJCCP: partial.isJCCP ?? null,
    isCQC: partial.isCQC ?? null,
    isHIW: partial.isHIW ?? null,
    isHIS: partial.isHIS ?? null,
    isRQIA: partial.isRQIA ?? null,
    about_section: partial.about_section ?? "",
    accreditations: partial.accreditations ?? "",
    awards: partial.awards ?? "",
    affiliations: partial.affiliations ?? "",
    hours: partial.hours ?? "",
    Practitioners: partial.Practitioners ?? "",
    Insurace: partial.Insurace ?? "",
    Payments: partial.Payments ?? "",
    Fees: partial.Fees ?? "",
    x_twitter: partial.x_twitter ?? "",
    Treatments: partial.Treatments,
    claimed: partial.claimed,
    awardsBadgeLabel: partial.awardsBadgeLabel,
    tatlerBadgeLabel: partial.tatlerBadgeLabel,
    aestheticsAwards: partial.aestheticsAwards,
    tatlerGuideYears: partial.tatlerGuideYears,
    verified: partial.verified,
    domainVerified: partial.domainVerified,
    gbpMatch: partial.gbpMatch,
    gbpVerified: partial.gbpVerified,
    idVerified: partial.idVerified,
    manualVerified: partial.manualVerified,
  }
}

interface AccreditedClinicsPageProps {
  params: {
    accreditation: string
  }
}

async function loadConsentzClaimedClinics(): Promise<Clinic[]> {
  const rows = await prisma.clinic.findMany({
    where: { claimed: true, isHidden: false },
    select: {
      slug: true,
      name: true,
      image: true,
      rating: true,
      reviewCount: true,
      category: true,
      gmapsAddress: true,
      claimed: true,
      city: { select: { name: true } },
    },
  })

  return rows.map((row) =>
    emptyClinic({
      slug: row.slug,
      image: row.image || "",
      rating: row.rating ? Number(row.rating) : 0,
      reviewCount: row.reviewCount || 0,
      category: row.category || "",
      gmapsAddress: row.gmapsAddress || "",
      City: row.city?.name || "",
      claimed: true,
    }),
  )
}

export default async function AccreditedClinicsPage({ params }: Readonly<AccreditedClinicsPageProps>) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }

  const clinics: Clinic[] =
    accreditation === "consentz"
      ? await loadConsentzClaimedClinics()
      : readJsonFileSync("clinics_processed_new_data.json").map((clinic: Clinic) =>
          applyPrestigeToClinic(clinic),
        )

  const filteredClinics = filterClinicsByAccreditation(clinics, accreditation)

  const rawCities = [...new Set(filteredClinics.map((c) => c.City).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b),
  )
  const cities =
    accreditation === "cqc" ? filterCqcAccreditedCities(rawCities) : rawCities
  const accreditationName = getAccreditationDisplayName(accreditation)

  return (
    <main className="bg-white">
      <SearchBar />
      <div className="mx-auto max-w-7xl md:px-4 pb-4 pt-4 md:pb-7">
        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0 md:pt-0 md:border-0 border-b border-[#C4C4C4]">
          <div className="sticky top-0 z-10">
            <Link className="mb-4 inline-flex items-center gap-3 text-sm hover:underline" href="/" prefetch={false}>
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            {accreditationName} Accredited Clinics
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Browse cities with {accreditationName} accredited clinics.
          </p>
        </div>

        {cities.length === 0 ? (
          <p className="px-4 md:px-0 text-sm text-gray-600">
            Clinics for this accreditation will appear here as profiles are verified and claimed.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 md:px-0">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/accredited/${accreditation}/clinics/${toUrlSlug(city)}`}
                className="block"
              >
                <Card className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer ">
                  <CardHeader className="pb-4">
                    <h3 className="mb-2 flex font-semibold text-md md:text-lg transition-colors text-balance group-hover:text-black">
                      {city}
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">
                      {filteredClinics.filter((c) => c.City === city).length}{" "}
                      clinic
                      {filteredClinics.filter((c) => c.City === city).length !== 1
                        ? "s"
                        : ""}{" "}
                      found
                    </p>
                    <Button className="w-full bg-black text-white hover:bg-white hover:text-black">
                      View Clinics
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: AccreditedClinicsPageProps) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }
  const accreditationName = getAccreditationDisplayName(accreditation)

  return {
    title: `${accreditationName} Accredited Clinics`,
    description: `Find ${accreditationName} accredited clinics across all cities. Compare ratings, reviews, and book appointments.`,
    alternates: {
      canonical: toDirectoryCanonical(`/accredited/${accreditation}/clinics`),
    },
    openGraph: {
      title: `${accreditationName} Accredited Clinics`,
      description: `Find ${accreditationName} accredited clinics across all cities. Compare ratings and reviews.`,
    },
  }
}
