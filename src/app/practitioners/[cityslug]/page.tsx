import Link from "next/link";
import type { Clinic, Practitioner, City } from "@/lib/types";
import { readJsonFileSync } from "@/lib/json-cache";
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
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { EmptyCityState } from "@/components/empty-city-state";
import { BestRankedBlock } from "@/components/best-ranked-block";
import { buildPractitionerRankedEntries } from "@/lib/best-ranked";
import { capitalize } from "@/lib/utils";
import { toDirectoryCanonical } from "@/lib/seo";
import { getAllPractitionersForSearch } from "@/lib/data-access/practitioners";
import { getAllClinicsForSearch } from "@/lib/data-access/clinics";

function getPopularTreatments(items: Clinic[]): string[] {
  const counts = new Map<string, number>();

  for (const clinic of items) {
    for (const treatment of clinic.Treatments ?? []) {
      counts.set(treatment, (counts.get(treatment) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 15)
    .map(([treatment]) => treatment);
}
interface ProfilePageProps {
  params: {
    cityslug: string;
    slug: string;
  };
}

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const [practitioners, clinicsFromDb] = await Promise.all([
    getAllPractitionersForSearch(),
    getAllClinicsForSearch(),
  ])
  const clinics = clinicsFromDb as unknown as Clinic[]

  const citySlug = params.cityslug;
  const displayCityName = capitalize(citySlug);
  const normalizedCitySlug = decodeURIComponent(citySlug).toLowerCase();
  const cityData = (readJsonFileSync<City[]>('city_data_processed.json')).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
  const cityClinics: Practitioner[] = practitioners.filter(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
  const hasCityPractitioners = cityClinics.length > 0;
  const rankedCityPractitioners = buildPractitionerRankedEntries(cityClinics, 5);
  const uniqueTreatments = [
    ...new Set(
      cityClinics
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];

  const defaultClinics: Practitioner[] = practitioners.filter((p) => p.City === "London");
  const popularClinics = [...clinics]
    .filter((clinic) => clinic.slug)
    .sort((left, right) => (right.reviewCount || 0) - (left.reviewCount || 0) || (Number(right.rating) || 0) - (Number(left.rating) || 0))
    .slice(0, 6);
  const popularPractitioners = [...practitioners]
    .sort((left, right) => (right.reviewCount || 0) - (left.reviewCount || 0) || (Number(right.rating) || 0) - (Number(left.rating) || 0))
    .slice(0, 6);
  const popularTreatments = getPopularTreatments(clinics);
  const defaultTreatments = [
    ...new Set(
      defaultClinics
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];
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
                  <BreadcrumbLink href="/directory/practitioners">
                    Practitioners
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}`}>{displayCityName}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div></div>
          
         
          <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
            <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">Top Aesthetic Practitioners in {displayCityName}</h1></div>

        {hasCityPractitioners && (
          <div className="px-4 md:px-0 pb-4">
            <BestRankedBlock
              title={`Best Practitioners in ${displayCityName}`}
              entries={rankedCityPractitioners}
            />
          </div>
        )}

        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Practitioner" />
          <div className="flex-1 min-w-0">
            {hasCityPractitioners ? (
              <ItemsGrid items={cityClinics} />
            ) : (
              <EmptyCityState
                citySlug={citySlug}
                pageLabel="practitioners"
                popularClinics={popularClinics}
                popularPractitioners={popularPractitioners}
                popularTreatments={popularTreatments}
              />
            )}
          </div>
        </div>

        {hasCityPractitioners && (
        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${displayCityName}`}</h3>
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
        )}
        {cityData && hasCityPractitioners && <CityPageData
          cityData={cityData}
          uniqueTreatments={uniqueTreatments as string[]}
          citySlug={citySlug}
          cityClinics={cityClinics}
        />}
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

export async function generateMetadata({ params }: ProfilePageProps) {
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const displayCityName = capitalize(citySlug);

  return {
    title: `Best Verified Aesthetic Practitioners in ${displayCityName} - Reviews & Booking`,
    description: `Find the best verified aesthetic practitioners in ${displayCityName}. Compare qualifications, real patient reviews and book your consultation.`,
    alternates: {
      canonical: toDirectoryCanonical(`/practitioners/${citySlug}`),
    },
  };
}
