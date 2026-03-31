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
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Clinic, Practitioner } from "@/lib/types"
import { readJsonFileSync } from "@/lib/json-cache"
import { SearchBar } from "@/components/search/search-bar";

function mapAccreditationToFieldPractitioner(accreditation: string): keyof Practitioner {
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
  }
}

export default async function AccreditedPractitionersPage({ params }: Readonly<AccreditedPractitionersPageProps>) {
  const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
  const clinics = clinicsData.filter(c => c.slug !== undefined)
  const clinicIndex = new Map(
    clinics.map(c => [c.slug!, c])
  )

  const practitioners: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json')

  const { accreditation } = params
  const accreditationField = mapAccreditationToFieldPractitioner(accreditation)

  const enrichedPractitioners = practitioners
    .map(p => {
      const clinic = clinicIndex.get(JSON.parse(p.Associated_Clinics!)[0])
      if (!clinic) return null
      return { ...clinic, ...p }
    })
    .filter(Boolean)

  const filteredPractitioners = enrichedPractitioners.filter(practitioner => {
    const accreditationValue = (practitioner as any)[accreditationField]
    let flag = false
    if (accreditationValue === true) {
      
        
        flag = true

    }
    else {
      if (accreditationValue && Array.isArray(accreditationValue) && accreditationValue[0] === true) {
        flag = true
        
      }
    }
    return flag
   
  })

  if (!filteredPractitioners.length) {
    notFound()
  }

  const cities = [...new Set(filteredPractitioners.map(p => p!.City))].sort((a, b) => a.localeCompare(b))
  const accreditationName = getAccreditationName(accreditation)
  const accreditationSlug =
  accreditationName.split("(")[1]?.replace(")", "") ?? accreditationName;


  return (
    <main className="bg-(--primary-bg-color)">
      <SearchBar />
      <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-7 ">
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
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 md:px-0">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/accredited/${accreditation}/practitioners/${city.toLowerCase()}`}
              className="block"
            >
              <Card className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer hover:shadow-lg ">
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
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: AccreditedPractitionersPageProps) {
  const { accreditation } = params
  const accreditationName = getAccreditationName(accreditation)

  return {
    title: `${accreditationName} Accredited Practitioners`,
    description: `Find ${accreditationName} accredited practitioners across all cities. Compare ratings, reviews, and book appointments.`,
    openGraph: {
      title: `${accreditationName} Accredited Practitioners`,
      description: `Find ${accreditationName} accredited practitioners across all cities. Compare ratings and reviews.`,
    }
  }
}
