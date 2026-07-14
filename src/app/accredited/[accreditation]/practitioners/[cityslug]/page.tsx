import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
  getAccreditationDisplayName,
  getPrestigeMatchingClinicSlugs,
  isKnownAccreditation,
  isRegulatoryAccreditation,
  normalizeAccreditationSlug,
} from "@/lib/accreditation-directory"

interface AccreditedPractitionersPageProps {
  params: {
    accreditation: string
    cityslug: string
  }
}

function practitionerHasRegulatoryFlag(practitioner: Record<string, unknown>, field: string): boolean {
  const value = practitioner[field]
  return value === true || (Array.isArray(value) && value[0] === true)
}

function associatedClinicSlugs(practitioner: { Associated_Clinics?: string | null }): string[] {
  if (!practitioner.Associated_Clinics) return []
  try {
    const parsed = JSON.parse(practitioner.Associated_Clinics)
    if (Array.isArray(parsed)) return parsed.filter((s): s is string => typeof s === "string")
  } catch {
    return []
  }
  return []
}

export default async function AccreditedPractitionersPage({
  params,
}: Readonly<AccreditedPractitionersPageProps>) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  const cityslug = decodeURIComponent(params.cityslug)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }

  const enrichedPractitioners = await getAllPractitionersForSearch()
  const prestigeClinicSlugs =
    accreditation === "aesthetics-awards" || accreditation === "tatler"
      ? getPrestigeMatchingClinicSlugs(accreditation)
      : null

  const matchesAccreditation = (practitioner: NonNullable<(typeof enrichedPractitioners)[number]>) => {
    if (isRegulatoryAccreditation(accreditation)) {
      const fieldMap: Record<string, string> = {
        cqc: "isCQC",
        jccp: "isJCCP",
        hiw: "isHIW",
        his: "isHIS",
        rqia: "isRQIA",
        saveface: "isSaveFace",
      }
      return practitionerHasRegulatoryFlag(practitioner as any, fieldMap[accreditation])
    }
    if (prestigeClinicSlugs) {
      return associatedClinicSlugs(practitioner as any).some((slug) => prestigeClinicSlugs.has(slug))
    }
    if (accreditation === "consentz") {
      return Boolean((practitioner as any).claimed)
    }
    return false
  }

  const filteredPractitioners = enrichedPractitioners.filter((practitioner) => {
    if (!practitioner) return false
    const cityMatch = practitioner.City?.toLowerCase() === cityslug.toLowerCase()
    return cityMatch && matchesAccreditation(practitioner)
  })

  const cityPractitioners = enrichedPractitioners.filter(
    (p) => p?.City?.toLowerCase() === cityslug.toLowerCase(),
  )
  const displayPractitioners = filteredPractitioners.length ? filteredPractitioners : cityPractitioners
  const isFallback = filteredPractitioners.length === 0
  const accreditationName = getAccreditationDisplayName(accreditation)

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl md:px-4 py-4 md:py-12">
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
                  <BreadcrumbLink href={`/accredited/${accreditation}/practitioners`}>
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
            {accreditationName} Practitioners in {cityslug}
          </h1>
          {isFallback && (
            <p className="text-sm text-amber-700 mb-4">
              No exact {accreditationName} matches in this city yet. Showing other practitioners in {cityslug}.
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
  }
}
