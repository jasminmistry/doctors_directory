import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  clinicMatchesAccreditation,
  getAccreditationDisplayName,
  isKnownAccreditation,
  normalizeAccreditationSlug,
} from "@/lib/accreditation-directory"
import { applyPrestigeToClinic } from "@/lib/prestige-accreditations"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

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
    cityslug: string
  }
}

async function loadConsentzClaimedClinicsForCity(cityslug: string): Promise<Clinic[]> {
  if (!process.env.DATABASE_URL) return []

  const rows = await prisma.clinic.findMany({
    where: {
      claimed: true,
      isHidden: false,
    },
    select: {
      slug: true,
      name: true,
      image: true,
      rating: true,
      reviewCount: true,
      category: true,
      gmapsAddress: true,
      gmapsPhone: true,
      website: true,
      claimed: true,
      isSaveFace: true,
      isDoctor: true,
      isJccp: true,
      isCqc: true,
      isHiw: true,
      isHis: true,
      isRqia: true,
      city: { select: { name: true } },
    },
  })

  return rows
    .filter((row) => row.city?.name?.toLowerCase() === cityslug.toLowerCase())
    .map((row) =>
      applyPrestigeToClinic(
        emptyClinic({
          slug: row.slug,
          image: row.image || "",
          rating: row.rating ? Number(row.rating) : 0,
          reviewCount: row.reviewCount || 0,
          category: row.category || "",
          gmapsAddress: row.gmapsAddress || "",
          gmapsPhone: row.gmapsPhone || "",
          website: row.website || "",
          City: row.city?.name || "",
          claimed: true,
          isSaveFace: row.isSaveFace,
          isDoctor: row.isDoctor,
          isJCCP: row.isJccp ? [true, ""] : null,
          isCQC: row.isCqc ? [true, ""] : null,
          isHIW: row.isHiw ? [true, ""] : null,
          isHIS: row.isHis ? [true, ""] : null,
          isRQIA: row.isRqia ? [true, ""] : null,
        }),
      ),
    )
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

  const clinics: Clinic[] =
    accreditation === "consentz"
      ? await loadConsentzClaimedClinicsForCity(cityslug)
      : readJsonFileSync("clinics_processed_new_data.json").map((clinic: Clinic) =>
          applyPrestigeToClinic(clinic),
        )

  const filteredClinics = clinics.filter((clinic) => {
    const cityMatch = clinic.City?.toLowerCase() === cityslug.toLowerCase()
    return cityMatch && clinicMatchesAccreditation(clinic, accreditation)
  })

  const cityClinics = clinics.filter((c) => c.City?.toLowerCase() === cityslug.toLowerCase())
  const displayClinics = filteredClinics.length ? filteredClinics : cityClinics
  const isFallback = filteredClinics.length === 0
  const accreditationName = getAccreditationDisplayName(accreditation)

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl md:px-4 py-4 md:py-12">
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
                  <BreadcrumbPage>{cityslug}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            {accreditationName} Clinics in {cityslug}
          </h1>
          {isFallback && (
            <p className="text-sm text-amber-700 mb-4">
              No exact {accreditationName} matches in this city yet. Showing other clinics in {cityslug}.
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
