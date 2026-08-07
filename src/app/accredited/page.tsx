import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Clinic } from "@/lib/types"
import { readJsonFileSync } from "@/lib/json-cache"
import { toDirectoryCanonical } from "@/lib/seo"
import {
  clinicMatchesAccreditation,
  getAccreditationDisplayName,
  getPrestigeMatchingClinicSlugs,
  PRESTIGE_ACCREDITATION_SLUGS,
  REGULATORY_ACCREDITATION_SLUGS,
} from "@/lib/accreditation-directory"
import { applyPrestigeToClinic } from "@/lib/prestige-accreditations"
import { getAllPractitionersForSearch } from "@/lib/data-access/practitioners"
import { prisma } from "@/lib/db"
import { IconArrowNarrowLeft, IconBriefcase, IconUsers } from "@tabler/icons-react"
const accreditations = ["CQC", "JCCP", "HIW", "HIS", "RQIA", "SaveFace"]

export const dynamic = "force-dynamic"

const ACCREDITATION_SLUGS = [
  ...REGULATORY_ACCREDITATION_SLUGS,
  ...PRESTIGE_ACCREDITATION_SLUGS,
] as const

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

export default async function AccreditedPage() {
  const clinicsData: Clinic[] = readJsonFileSync("clinics_processed_new_data.json")
  const clinics = clinicsData
    .filter((c) => c.slug !== undefined)
    .map((c) => applyPrestigeToClinic(c))

  const claimedCount = process.env.DATABASE_URL
    ? await prisma.clinic.count({
        where: { claimed: true, isHidden: false },
      })
    : 0

  const practitioners = await getAllPractitionersForSearch()

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
                  <BreadcrumbPage>Accredited Clinics & Practitioners</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            Accredited Clinics & Practitioners
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Browse healthcare providers accredited by recognized regulatory
            bodies, industry awards, and professional guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          {ACCREDITATION_SLUGS.map((accreditation) => {
            const label = getAccreditationDisplayName(accreditation)
            const prestigeSlugs =
              accreditation === "aesthetics-awards" || accreditation === "tatler"
                ? getPrestigeMatchingClinicSlugs(accreditation)
                : null

            const clinicCount =
              accreditation === "consentz"
                ? claimedCount
                : clinics.filter((c) => clinicMatchesAccreditation(c, accreditation)).length

            const practitionerCount = practitioners.filter((p) => {
              if (!p) return false
              if (accreditation === "consentz") return Boolean((p as any).claimed)
              if (prestigeSlugs) {
                return associatedClinicSlugs(p as any).some((slug) => prestigeSlugs.has(slug))
              }
              return clinicMatchesAccreditation(p as any, accreditation)
            }).length

            return (
              <Card
                key={accreditation}
                className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer hover:shadow-lg"
              >
                <CardHeader className="pb-4">
                  <h3 className="mb-2 flex font-semibold text-md md:text-lg transition-colors text-balance group-hover:text-black">
                    {label}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Browse {label} accredited healthcare providers.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <IconBriefcase stroke={1.5} className="h-4 w-4" />
                        {clinicCount} Clinic{clinicCount !== 1 ? "s" : ""}
                      </span>
                      <Link href={`/accredited/${accreditation}/clinics`}>
                        <Button
                          size="sm"
                          className="cursor-pointer bg-black text-white hover:bg-white hover:text-black"
                        >
                          View Clinics
                        </Button>
                      </Link>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <IconUsers stroke={1.5} className="h-4 w-4" />
                        {practitionerCount} Practitioner
                        {practitionerCount !== 1 ? "s" : ""}
                      </span>
                      <Link href={`/accredited/${accreditation}/practitioners`}>
                        <Button
                          size="sm"
                          className="cursor-pointer bg-black text-white hover:bg-white hover:text-black"
                        >
                          View Practitioners
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata() {
  return {
    title: "Accredited Clinics & Practitioners - Healthcare Directory",
    description:
      "Find accredited clinics and practitioners by CQC, JCCP, HIW, HIS, RQIA, Save Face, Consentz, Tatler, and Aesthetics Awards.",
    alternates: {
      canonical: toDirectoryCanonical("/accredited"),
    },
    openGraph: {
      title: "Accredited Clinics & Practitioners - Healthcare Directory",
      description:
        "Find accredited clinics and practitioners by regulatory bodies, Consentz, Tatler, and Aesthetics Awards.",
    },
  }
}
