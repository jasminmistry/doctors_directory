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
import { IconArrowNarrowLeft } from "@tabler/icons-react"
import { Clinic } from "@/lib/types"
import { readJsonFileSync } from "@/lib/json-cache"
import { PractitionerCard } from "@/components/practitioner-card"
import { isAllowedCqcAccreditedCity } from '@/lib/accredited-city-filter'
import { toDirectoryCanonical } from "@/lib/seo"
import { notFound } from 'next/navigation'
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
  const { accreditation, cityslug } = params
  if (accreditation.toLowerCase() === 'cqc' && !isAllowedCqcAccreditedCity(cityslug)) {
    notFound()
  }

  const clinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
  const accreditationField = mapAccreditationToField(accreditation)

  const filteredClinics = clinics.filter(clinic => {
    const cityMatch = clinic.City?.toLowerCase() === cityslug.toLowerCase()
    const accreditationValue = clinic[accreditationField]
    const accreditationMatch = accreditationValue === true || (Array.isArray(accreditationValue) && accreditationValue[0] === true)
    return cityMatch && accreditationMatch
  })

  const cityClinics = clinics.filter(c => c.City?.toLowerCase() === cityslug.toLowerCase())
  const displayClinics = filteredClinics.length ? filteredClinics : cityClinics
  const isFallback = filteredClinics.length === 0

  const accreditationName = accreditation.charAt(0).toUpperCase() + accreditation.slice(1)
  const accreditationSlug =
  accreditationName.split("(")[1]?.replace(")", "") ?? accreditationName;

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
                  <BreadcrumbLink
                    href={`/accredited/${accreditationSlug}/practitioners`}
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
            {isFallback
              ? `Top Clinics in ${cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}`
              : `Top ${accreditationName} Accredited Clinics in ${cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}`}
          </h1>
          {isFallback && (
            <p className="text-sm text-muted-foreground mb-4">
              No {accreditationName} accredited clinics found in {cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}.{" "}
              Showing all clinics in this area instead.{" "}
              <Link href={`/accredited/${accreditation}/clinics`} className="underline">
                Browse all {accreditationName} accredited cities
              </Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 animate-fade-in">
          {displayClinics.map((clinic) => (
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
  if (accreditation.toLowerCase() === 'cqc' && !isAllowedCqcAccreditedCity(cityslug)) {
    notFound()
  }
  const accreditationName = accreditation.charAt(0).toUpperCase() + accreditation.slice(1)
  const canonicalAccreditation = decodeURIComponent(accreditation).toLowerCase()
  const canonicalCity = decodeURIComponent(cityslug).toLowerCase()

  return {
    title: `Accredited ${accreditationName} Clinics in ${cityslug}`,
    description: `Find ${accreditationName} accredited clinics in ${cityslug}. Compare ratings, reviews, and book appointments with verified healthcare providers.`,
    alternates: {
      canonical: toDirectoryCanonical(`/accredited/${canonicalAccreditation}/clinics/${canonicalCity}`),
    },
    openGraph: {
      title: `Accredited ${accreditationName} Clinics in ${cityslug}`,
      description: `Find ${accreditationName} accredited clinics in ${cityslug}. Compare ratings and reviews.`,
    }
  }
}
