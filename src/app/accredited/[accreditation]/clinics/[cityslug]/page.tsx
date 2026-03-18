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
import { Clinic } from "@/lib/types"
import fs from "fs"
import path from "path"
import { PractitionerCard } from "@/components/practitioner-card"
import ClinicsJSON from "@/../public/clinics_processed_new_data.json";
function mapAccreditationToField(accreditation: string): keyof Clinic {
  const mapping: Record<string, keyof Clinic> = {
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

interface AccreditedClinicsPageProps {
  params: {
    accreditation: string
    cityslug: string
  }
}

export default async function AccreditedClinicsPage({ params }: Readonly<AccreditedClinicsPageProps>) {
  const clinics = ClinicsJSON as unknown as Clinic[];
  const { accreditation, cityslug } = params
  const accreditationField = mapAccreditationToField(accreditation)

  const filteredClinics = clinics.filter(clinic => {
    const cityMatch = clinic.City?.toLowerCase() === cityslug.toLowerCase()
    const accreditationValue = clinic[accreditationField]
    const accreditationMatch = Array.isArray(accreditationValue) && accreditationValue[0] === true
    return cityMatch && accreditationMatch
  })

  if (!filteredClinics.length) {
    notFound()
  }

  const accreditationName = accreditation.charAt(0).toUpperCase() + accreditation.slice(1)
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
                    href={`/directory /accredited/${accreditationSlug}/practitioners`}
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
            Top {accreditationName} Accredited Clinics in{" "}
            {cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 animate-fade-in">
          {filteredClinics.map((clinic, index) => (
            <PractitionerCard key={clinic.slug} practitioner={clinic} />
          ))}
        </div>
      </div>
    </main>
  );
}

// export async function generateStaticParams() {
//   const filePath = path.join(process.cwd(), "public", "clinics_processed_new_data.json")
//   const fileContents = fs.readFileSync(filePath, "utf-8")
//   const clinics: Clinic[] = JSON.parse(fileContents)
//
//   const cities = [...new Set(clinics.map(c => c.City))]
//   const accreditationTypes = ['cqc', 'jccp', 'hiw', 'his', 'rqia', 'saveface']
//
//   return accreditationTypes.flatMap(accreditation =>
//     cities.map(city => ({
//       accreditation,
//       cityslug: city.toLowerCase()
//     }))
//   )
// }

export async function generateMetadata({ params }: AccreditedClinicsPageProps) {
  const { accreditation, cityslug } = params
  const accreditationName = accreditation.charAt(0).toUpperCase() + accreditation.slice(1)

  return {
    title: `Accredited ${accreditationName} Clinics in ${cityslug}`,
    description: `Find ${accreditationName} accredited clinics in ${cityslug}. Compare ratings, reviews, and book appointments with verified healthcare providers.`,
    openGraph: {
      title: `Accredited ${accreditationName} Clinics in ${cityslug}`,
      description: `Find ${accreditationName} accredited clinics in ${cityslug}. Compare ratings and reviews.`,
    }
  }
}
