import Link from "next/link"
import { ArrowLeft, Users, Briefcase } from "lucide-react"
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
import { Clinic, Practitioner } from "@/lib/types"
import { readJsonFileSync } from "@/lib/json-cache"
import { toDirectoryCanonical } from "@/lib/seo"
const accreditations = ["CQC", "JCCP", "HIW", "HIS", "RQIA", "SaveFace"]

function mapAccreditationToFieldClinic(accreditation: string): keyof Clinic {
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

export default async function AccreditedPage() {
  const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
  const clinics = clinicsData.filter(c => c.slug !== undefined)
  const clinicIndex = new Map(
    clinics.map(c => [c.slug!, c])
  )

  const practitioners: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json')

  const enrichedPractitioners = practitioners
    .map(p => {
      const clinic = clinicIndex.get(JSON.parse(p.Associated_Clinics!)[0])
      if (!clinic) return null
      return { ...clinic, ...p }
    })
    .filter(Boolean)

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
            bodies and professional organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          {accreditations.map((accreditation) => {
            const accreditationFieldClinic =
              mapAccreditationToFieldClinic(accreditation);

            const accreditationFieldPractitioner =
              mapAccreditationToFieldPractitioner(accreditation);

            const clinicCount = clinics.filter((c) => {
              const accreditationValue = c[accreditationFieldClinic];

              let flag = false;
              if (accreditationValue === true) {
                flag = true;
              } else {
                if (
                  accreditationValue &&
                  Array.isArray(accreditationValue) &&
                  accreditationValue[0] === true
                ) {
                  flag = true;
                }
              }
              return flag;
            }).length;

            const practitionerCount = enrichedPractitioners.filter((p) => {
              if (!p) return false;
              const accreditationValue = (p as any)[
                accreditationFieldPractitioner
              ];
              let flag = false;
              if (accreditationValue === true) {
                flag = true;
              } else {
                if (
                  accreditationValue &&
                  Array.isArray(accreditationValue) &&
                  accreditationValue[0] === true
                ) {
                  flag = true;
                }
              }
              return flag;
            }).length;

            return (
              <Card className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border0 md:border-(--alto) cursor-pointer hover:shadow-lg">
                <CardHeader className="pb-4">
                  <h3 className="mb-2 flex font-semibold text-md md:text-lg transition-colors text-balance group-hover:text-black">
                    {accreditation}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Browse {accreditation} accredited healthcare providers.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
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
                        <Users className="h-4 w-4" />
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
            );
          })}
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata() {
  return {
    title: 'Accredited Clinics & Practitioners - Healthcare Directory',
    description: 'Find accredited clinics and practitioners by regulatory bodies including CQC, JCCP, HIW, HIS, RQIA, and Save Face. Compare ratings, reviews, and book appointments.',
    alternates: {
      canonical: toDirectoryCanonical('/accredited'),
    },
    openGraph: {
      title: 'Accredited Clinics & Practitioners - Healthcare Directory',
      description: 'Find accredited clinics and practitioners by regulatory bodies including CQC, JCCP, HIW, HIS, RQIA, and Save Face.',
    }
  }
}
