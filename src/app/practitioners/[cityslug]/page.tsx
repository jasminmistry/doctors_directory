import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Clinic, Practitioner, City } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import fs from "fs";
import path from "path";
import clinicsJson from "@/../public/clinics_processed_new_data.json";
import cityJson from "@/../public/city_data_processed.json";
import { CityPageData } from "@/components/cityPageData";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
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
import ItemsGrid from "@/components/collectionGrid";
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
const clinicsData = clinicsJson as unknown as Clinic[];
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)
const filePath = path.join(process.cwd(), "public", "derms_processed_new_5403.json");
     const fileContents = fs.readFileSync(filePath, "utf-8");
     const all_practitioners: Practitioner[] = JSON.parse(fileContents);
       const practitioners = all_practitioners
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
interface ProfilePageProps {
  params: {
    cityslug: string;
    slug: string;
  };
}

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  
  
  
  const citySlug = params.cityslug;
  const normalizedCitySlug = decodeURIComponent(citySlug).toLowerCase();
  const cityData: City = (cityJson as unknown as City[]).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  )!;
  const cityClinics: Practitioner[] = practitioners.filter(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
    const uniqueTreatments = [
  ...new Set(
    cityClinics
      .filter(c => Array.isArray(c.Treatments))
      .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
  )
];

  const defaultClinics: Practitioner[] = practitioners.filter((p) => p.City === "London");
  const defaultTreatments = [
  ...new Set(
      defaultClinics
      .filter(c => Array.isArray(c.Treatments))
      .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
  )
];
  if (!cityClinics) {
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
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}`}>{citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div></div>
          
         
          <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
            <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">Top Aesthetic Practitioners in {citySlug}</h1></div>

        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Practitioner" />
          <div className="flex-1 min-w-0">
            <ItemsGrid items={cityClinics} />
          </div>
        </div>

        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${citySlug}`}</h3>
          <MoreItems
            items={
              uniqueTreatments.length === 0
                ? defaultTreatments
                : uniqueTreatments
            }
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Cities in the UK`}</h3>
          <MoreItems items={locations} />
        </div>
        <CityPageData
          cityData={cityData}
          uniqueTreatments={uniqueTreatments as string[]}
          citySlug={citySlug}
          cityClinics={cityClinics}
        />
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
