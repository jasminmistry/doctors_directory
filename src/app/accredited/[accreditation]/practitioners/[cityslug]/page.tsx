import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Practitioner } from "@/lib/types"
import { accreditations } from "@/lib/data"
import { getAllPractitionersForSearch } from "@/lib/data-access/practitioners"
import { PractitionerCard } from "@/components/practitioner-card"
import { toDirectoryCanonical } from "@/lib/seo"

function mapAccreditationToField(accreditation: string): keyof Practitioner {
  const mapping: Record<string, keyof Practitioner> = {
    cqc: 'isCQC',
    jccp: 'isJCCP',
    hiw: 'isHIW',
    his: 'isHIS',
    rqia: 'isRQIA',
    saveface: 'isSaveFace',
  }
  const field = mapping[accreditation.toLowerCase()]
  if (!field) throw new Error(`Invalid accreditation: ${accreditation}`)
  return field
}

function getAccreditationName(accreditation: string): string {
  const mapping: Record<string, string> = {
    cqc: 'Care Quality Commission (CQC)',
    jccp: 'Joint Council for Cosmetic Practitioners (JCCP)',
    hiw: 'Health Inspectorate Wales (HIW)',
    his: 'Healthcare Improvement Scotland (HIS)',
    rqia: 'Regulation and Quality Improvement Authority (RQIA)',
    saveface: 'Save Face',
  }
  return mapping[accreditation.toLowerCase()] || accreditation
}

interface AccreditedPractitionersPageProps {
  params: {
    accreditation: string
    cityslug: string
  }
}

export default async function AccreditedPractitionersPage({ params }: Readonly<AccreditedPractitionersPageProps>) {
  const enrichedPractitioners = await getAllPractitionersForSearch()

  const { accreditation, cityslug } = params
  const accreditationField = mapAccreditationToField(accreditation)

  const filteredPractitioners = enrichedPractitioners.filter(practitioner => {
    if (!practitioner) return false
    const cityMatch = practitioner.City?.toLowerCase() === cityslug.toLowerCase()
    const accreditationValue = practitioner[accreditationField]
    const accreditationMatch = Array.isArray(accreditationValue) && accreditationValue[0] === true
    return cityMatch && accreditationMatch
  })

  if (!filteredPractitioners.length) {
    notFound()
  }

  const accreditationName = getAccreditationName(accreditation)
  const accreditationSlug =
  accreditationName.split("(")[1]?.replace(")", "") ?? accreditationName;

  return (
    <main className="bg-(--primary-bg-color)">
      <div className="mx-auto max-w-6xl md:px-4 py-4 md:py-12">
        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0 md:pt-0 md:border-0 border-b border-[#C4C4C4]">
          <div className="sticky top-0 z-10">
            <Link className="mb-2 inline-block" href="/" prefetch={false}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/directory">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/directory/accredited">
                    Accredited Clinics & Practitioners
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/directory/accredited/${accreditationSlug}/practitioners`}
                  >
                    {accreditationSlug}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            Accredited {accreditationName} Practitioners in{" "}
            {cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 animate-fade-in">
          {filteredPractitioners
            .map((practitioner, index) => {
              if (!practitioner) return null;
              return (
                <PractitionerCard
                  key={
                    practitioner.practitioner_name! +
                    practitioner.practitioner_title
                  }
                  practitioner={practitioner}
                />
              );
            })
            .filter(Boolean)}
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: AccreditedPractitionersPageProps) {
  const { accreditation, cityslug } = params
  const accreditationName = getAccreditationName(accreditation)
  const canonicalAccreditation = decodeURIComponent(accreditation).toLowerCase()
  const canonicalCity = decodeURIComponent(cityslug).toLowerCase()

  return {
    title: `Accredited ${accreditationName} Practitioners in ${cityslug}`,
    description: `Find ${accreditationName} accredited practitioners in ${cityslug}. Compare ratings, reviews, and book appointments with verified healthcare providers.`,
    alternates: {
      canonical: toDirectoryCanonical(`/accredited/${canonicalAccreditation}/practitioners/${canonicalCity}`),
    },
    openGraph: {
      title: `Accredited ${accreditationName} Practitioners in ${cityslug}`,
      description: `Find ${accreditationName} accredited practitioners in ${cityslug}. Compare ratings and reviews.`,
    }
  }
}
