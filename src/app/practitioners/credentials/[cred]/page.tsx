import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Clinic, Practitioner, Accreditation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import clinicsJson from "@/../public/clinics_processed_new_data.json";
import fs from "fs";
import path from "path";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PractitionerCard } from "@/components/practitioner-card";
import { Item } from "@radix-ui/react-accordion";
import ItemsGrid from "@/components/collectionGrid";
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import practitionersJSON from "@/../public/derms_processed_new_5403.json";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
import { CredentialPageData } from "@/components/credentialPageData";
import credentialJSON from "@/../public/accreditations_processed_new.json";
const credentialsData = credentialJSON as unknown as Accreditation[];
const credentialIndex = new Map(
  credentialsData.map(c => [c.slug!, c])
)
const clinicsData = clinicsJson as unknown as Clinic[];
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)
interface ProfilePageProps {
  params: {
    cred: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const clinics = practitionersJSON as unknown as Practitioner[];
     const practitioners = clinics
  .map(p => {
    const clinic = clinicIndex.get(JSON.parse(p.Associated_Clinics!)[0])
    
    if (!clinic) return null
    return {
      ...clinic,
      practitioner_name: p.practitioner_name,
      practitioner_title: p.practitioner_title,
      practitioner_qualifications: p.practitioner_qualifications,
      practitioner_awards: p.practitioner_awards,
    }
  
  })
  .filter((item) => item !==null).filter(Boolean)

  const { cred } = params;
  console.log(cred)
  const credslug = decodeURIComponent(cred).toLowerCase().replace(/\s+/g, "");
  const filteredClinics = practitioners.filter((clinic) => {
    // Filter by city
    const qualifications = clinic.practitioner_qualifications
    const awards = clinic.practitioner_awards
    const qMatch = qualifications?.toLowerCase().replace(/\s+/g, "").includes(credslug)
    const aMatch = awards?.toLowerCase().replace(/\s+/g, "").includes(credslug)



    return qMatch || aMatch
  });
  console.log(filteredClinics.length)

  const uniqueTreatments = [
    ...new Set(
      filteredClinics
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];

  if (!filteredClinics) {
    notFound();
  }

  return (
    <main className="bg-(--primary-bg-color)">
      <SearchBar />
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
                  <BreadcrumbLink href="/directory/practitioners">
                    Practitioners
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/directory/practitioners/credentials">
                    Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/directory/practitioners/credentials/${cred
                      .replaceAll("%20", " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}`}
                  >
                    {cred
                      .replaceAll("%20", " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />\{" "}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
            <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
              {cred
                .replaceAll("%20", " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}{" "}
              Recognized Providers
            </h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Practitioner" />
          <div className="flex-1 min-w-0">
            <ItemsGrid items={filteredClinics} />
          </div>
        </div>
        <CredentialPageData
          credentialSlug={cred.replaceAll("%20", "-")}
          credentialData={credentialIndex.get(cred.replaceAll("%20", "-"))!}
        />
        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments`}</h3>
          <MoreItems items={uniqueTreatments} />
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Cities in the UK`}</h3>
          <MoreItems items={locations} />
        </div>
      </div>
    </main>
  );
}

// export async function generateStaticParams() {
//   const practitioners = await getPractitioners();
//   return practitioners.map((practitioner) => ({
//     slug: practitioner.slug,
//   }))
// }

// export async function generateMetadata({ params }: ProfilePageProps) {
//   const clinics = await getClinics();
//   const clinic = clinics.find((p) => p.slug === params.slug)

//   if (!clinic) {
//     return {
//       title: "Practitioner Not Found",
//     }
//   }

//   const clinicName = clinic.slug

//   return {
//     title: `${clinicName} - Healthcare Directory`,
//     description: `View the profile of ${clinicName}, a qualified ${clinic.category} offering professional healthcare services. Read reviews and book appointments.`,
//   }
// }
