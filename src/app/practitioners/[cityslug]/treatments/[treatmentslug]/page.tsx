import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Clinic, Practitioner, City } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import clinicsJson from "@/../public/clinics_processed_new_data.json";
import fs, { cp } from "fs";
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
import { CityTreatmentPage } from "@/components/cityxTreatmentPage";
import cityJson from "@/../public/city_data_processed.json"
import treatment_content from "@//../public/treatments.json";
import ItemsGrid from "@/components/collectionGrid";
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import PractitionersJSON from "@/../public/derms_processed_new_5403.json";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
type TreatmentSlug = keyof typeof treatment_content

const clinicsData = clinicsJson as unknown as Clinic[];
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)
interface ProfilePageProps {
  params: {
    cityslug: string;
   treatmentslug: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  
  const clinics = PractitionersJSON as unknown as Practitioner[];

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

  const { cityslug, treatmentslug } = params;
  const normalizedCitySlug = decodeURIComponent(cityslug).toLowerCase();
  const cityData: City = (cityJson as unknown as City[]).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  )!;
   const decodedCitySlug = decodeURIComponent(cityslug)
  .toLowerCase()
  .replace(/\s+/g, "");
  const decodedTreatmentSlug = decodeURIComponent(treatmentslug)
  .toLowerCase()
  .replace(/\s+/g, "");

  const filteredClinics = practitioners.filter((clinic) => {
    // Filter by city
    const cityMatch = clinic.City?.toLowerCase() === decodedCitySlug.toLowerCase();
    // Filter by offered service category
    const categories =
      clinic.Treatments ?? [];
    
  


    const serviceMatch = categories.some(
      (cat: string) => cat.replaceAll(" ","").toLowerCase() === decodedTreatmentSlug.replaceAll("%20","").toLowerCase()
    );


    return cityMatch && serviceMatch
  });

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
  const treatmentSlug = treatmentslug.replaceAll("%20", " ").charAt(0).toUpperCase() + treatmentslug.replaceAll("%20", " ").slice(1)
  const treatment = treatment_content[treatmentSlug as TreatmentSlug] as Record<string, any>;
  
  
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
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}`}>{cityslug.charAt(0).toUpperCase() + cityslug.slice(1)}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}/treatments/${treatmentslug}`}>{treatmentslug.replace("%20", " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
            <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
              Top{" "}
              {treatmentslug
                .replace("%20", " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}{" "}
              Providers in {cityslug}
            </h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Practitioner" />
          <div className="flex-1 min-w-0">
            <ItemsGrid items={filteredClinics} />
          </div>
        </div>
        <CityTreatmentPage
          cityData={cityData}
          treatment={treatment}
          slug={treatmentslug.replaceAll("%20", " ")}
        />
        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${cityslug}`}</h3>
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
