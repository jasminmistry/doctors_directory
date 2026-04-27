import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Clinic, City } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
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
import { CityTreatmentPage } from "@/components/cityxTreatmentPage";
import  ItemsGrid  from "@/components/collectionGrid";
import { MoreItems } from "@/components/MoreItems";
import treatment_content from "@//../public/treatments.json";
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { readJsonFileSync } from "@/lib/json-cache"
import { locations, modalities } from "@/lib/data";
import { capitalize, toUrlSlug } from "@/lib/utils";
import { BestRankedBlock } from "@/components/best-ranked-block";
import { buildClinicRankedEntries } from "@/lib/best-ranked";
import { toDirectoryCanonical } from "@/lib/seo";
interface ProfilePageProps {
  params: {
    cityslug: string;
    serviceslug: string;
  };
}
type TreatmentSlug = keyof typeof treatment_content
// Object.keys(treatment_content).forEach(key => {
//   console.log(Object.entries(treatment_content[key as TreatmentSlug])[10])
// })
export default function ProfilePage({ params }: ProfilePageProps) {
  const clinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json');
  const { cityslug, serviceslug } = params;
  const cityDisplayName = capitalize(cityslug);
  const normalizedCitySlug = decodeURIComponent(cityslug).toLowerCase();
  const normalizedServiceName =
    modalities.find((m) => toUrlSlug(m) === serviceslug) ??
    (() => {
      const decoded = serviceslug.replaceAll('%20', ' ');
      return modalities.find((m) => m === decoded) ?? decoded;
    })();
  const cityData: City = (readJsonFileSync<City[]>('city_data_processed.json')).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  )!;
  const treatmentslug = normalizedServiceName.charAt(0).toUpperCase() + normalizedServiceName.slice(1);
  const treatment = treatment_content[treatmentslug as TreatmentSlug] as Record<string, any>;
  const decodedCitySlug = decodeURIComponent(cityslug)
  .toLowerCase()
  .replace(/\s+/g, "");
  const decodedServiceSlug = normalizedServiceName.toLowerCase().replace(/[\s-]+/g, "");
  const filteredClinics = clinics.filter((clinic) => {
    // Filter by city
    
    const cityMatch = clinic.City?.toLowerCase() === decodedCitySlug.toLowerCase();
    // Filter by offered service category
    const categories =
      clinic.Treatments ?? [];
    
  

    
    

const serviceMatch = categories.some((cat: string) =>
  cat.toLowerCase().replace(/[\s-]+/g, "") === decodedServiceSlug
);



    return cityMatch && serviceMatch
  });
  const rankedClinics = buildClinicRankedEntries(filteredClinics, 5);
  const cityClinics = clinics.filter(
    (clinic) => clinic.City?.toLowerCase() === decodedCitySlug.toLowerCase()
  );
  const uniqueTreatments = [
  ...new Set(
    filteredClinics
      .filter(c => Array.isArray(c.Treatments))
      .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
  )
];
  const cityTreatments = [
    ...new Set(
      cityClinics
        .filter((c) => Array.isArray(c.Treatments))
        .flatMap((c) => c.Treatments)
        .filter((t): t is string => typeof t === "string")
    ),
  ];

  const defaultClinics: Clinic[] = clinics.filter((p) => p.City === "London");
  const defaultTreatments = [
  ...new Set(
      defaultClinics
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
                  <BreadcrumbLink href="/directory/clinics">
                    All Clinics
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                 <BreadcrumbItem>
                  <BreadcrumbLink href={`/directory/clinics/${normalizedCitySlug}`}>{cityDisplayName}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {serviceslug.charAt(0).toUpperCase() +
                      serviceslug.replaceAll("%20", " ").slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            Top {serviceslug.replaceAll("%20", " ")} Providers in {cityDisplayName}
          </h1>
        </div>

        {filteredClinics.length > 0 && (
          <div className="px-4 md:px-0 pb-4">
            <BestRankedBlock
              title={`Best ${normalizedServiceName} Clinics in ${cityDisplayName}`}
              entries={rankedClinics}
            />
          </div>
        )}

        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Clinic" />
          <div className="flex-1 min-w-0">
            {filteredClinics.length > 0 ? (
              <ItemsGrid items={filteredClinics} />
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <h2 className="text-lg font-semibold">No clinics listed yet</h2>
                  <p className="text-sm text-muted-foreground">
                    We do not have any clinics for {normalizedServiceName} in {cityDisplayName} right now.
                    You can still explore nearby and popular options below.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Link href={`/clinics/${normalizedCitySlug}`} prefetch={false}>
                    <Button variant="outline">Browse clinics in {cityDisplayName}</Button>
                  </Link>
                  <Link href={`/practitioners/${normalizedCitySlug}`} prefetch={false}>
                    <Button variant="outline">Browse practitioners in {cityDisplayName}</Button>
                  </Link>
                  <Link href="/clinics" prefetch={false}>
                    <Button>View all clinics</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${cityDisplayName}`}</h3>
          <MoreItems
            items={
              uniqueTreatments.length === 0
                ? cityTreatments.length > 0
                  ? cityTreatments
                  : defaultTreatments
                : uniqueTreatments
            }
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Cities in the UK`}</h3>
          <MoreItems items={locations} />
        </div>
        {treatment && cityData && (
          <CityTreatmentPage
            cityData={cityData}
            treatment={treatment}
            slug={serviceslug.replaceAll("%20", " ")}
          />
        )}
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
export async function generateMetadata({ params }: ProfilePageProps) {
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const serviceSlug = decodeURIComponent(params.serviceslug).toLowerCase();
  const displayCityName = capitalize(citySlug);
  const displayServiceName = capitalize(serviceSlug);

  return {
    title: `Top ${displayServiceName} Clinics in ${displayCityName} | Reviews, Prices & Booking`,
    description: `Find the best verified ${displayServiceName} clinics in ${displayCityName}. Compare real patient reviews, prices and book your treatment.`,
    alternates: {
      canonical: toDirectoryCanonical(`/clinics/${citySlug}/services/${serviceSlug}`),
    },
  };
}
// }
