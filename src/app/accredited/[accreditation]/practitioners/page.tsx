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
import { toDirectoryCanonical } from "@/lib/seo"
import { getAllPractitionersForSearch } from "@/lib/data-access/practitioners"
import {
  getAccreditationDisplayName,
  getPrestigeMatchingClinicSlugs,
  isKnownAccreditation,
  isPrestigeAccreditation,
  isRegulatoryAccreditation,
  normalizeAccreditationSlug,
} from "@/lib/accreditation-directory"
import { getPractitionerDirectoryRobots } from "@/lib/practitioner-profile-robots"

export const dynamic = "force-dynamic"

interface AccreditedPractitionersPageProps {
  params: {
    accreditation: string
  }
}

function practitionerHasRegulatoryFlag(practitioner: Record<string, unknown>, field: string): boolean {
  const value = practitioner[field]
  return value === true || (Array.isArray(value) && value[0] === true)
}

function associatedClinicSlugs(practitioner: { Associated_Clinics?: string | null; slug?: string }): string[] {
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
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }

  const enrichedPractitioners = await getAllPractitionersForSearch()
  const prestigeClinicSlugs =
    accreditation === "aesthetics-awards" || accreditation === "tatler"
      ? getPrestigeMatchingClinicSlugs(accreditation)
      : null

  const filteredPractitioners = enrichedPractitioners.filter((practitioner) => {
    if (!practitioner) return false
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
      const clinicSlugs = associatedClinicSlugs(practitioner as any)
      return clinicSlugs.some((slug) => prestigeClinicSlugs.has(slug))
    }

    if (accreditation === "consentz") {
      return Boolean((practitioner as any).claimed)
    }

    return false
  })

  const cities = [
    ...new Set(
      filteredPractitioners
        .map((p) => p!.City)
        .filter((c): c is string => Boolean(c)),
    ),
  ].sort((a, b) => a.localeCompare(b))
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
                  <BreadcrumbLink href={`/accredited/${accreditation}/practitioners`}>
                    {accreditationName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            {accreditationName} Accredited Practitioners
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Browse cities with {accreditationName} accredited practitioners.
            {isPrestigeAccreditation(accreditation) && (
              <>
                {" "}
                Prefer clinic listings?{" "}
                <Link
                  href={`/accredited/${accreditation}/clinics`}
                  className="underline text-foreground"
                >
                  View {accreditationName} accredited clinics
                </Link>
                .
              </>
            )}
          </p>
        </div>

        {cities.length === 0 ? (
          <p className="px-4 md:px-0 text-sm text-gray-600">
            Practitioners for this accreditation will appear here as profiles are linked and verified.{" "}
            <Link href={`/accredited/${accreditation}/clinics`} className="underline text-foreground">
              Browse {accreditationName} clinics
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 md:px-0">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/accredited/${accreditation}/practitioners/${city.toLowerCase()}`}
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
                      {
                        filteredPractitioners.filter((p) => p!.City === city)
                          .length
                      }{" "}
                      practitioner
                      {filteredPractitioners.filter((p) => p!.City === city)
                        .length !== 1
                        ? "s"
                        : ""}{" "}
                      found
                    </p>
                    <Button className="w-full bg-black text-white hover:bg-white hover:text-black">
                      View Practitioners
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

export async function generateMetadata({ params }: AccreditedPractitionersPageProps) {
  const accreditation = normalizeAccreditationSlug(params.accreditation)
  if (!isKnownAccreditation(accreditation)) {
    notFound()
  }
  const accreditationName = getAccreditationDisplayName(accreditation)
  const robots = getPractitionerDirectoryRobots()

  return {
    title: `${accreditationName} Accredited Practitioners`,
    description: `Find ${accreditationName} accredited practitioners across all cities. Compare ratings, reviews, and book appointments.`,
    alternates: {
      canonical: toDirectoryCanonical(`/accredited/${accreditation}/practitioners`),
    },
    openGraph: {
      title: `${accreditationName} Accredited Practitioners`,
      description: `Find ${accreditationName} accredited practitioners across all cities. Compare ratings and reviews.`,
    },
    ...(robots ? { robots } : {}),
  }
}
