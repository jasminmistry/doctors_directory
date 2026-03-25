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
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { EmptyCityState } from "@/components/empty-city-state";
const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)
const all_practitioners: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json')
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
  
  
  
  const citySlug = params.cityslug;
  const normalizedCitySlug = decodeURIComponent(citySlug).toLowerCase();
  const cityData = (readJsonFileSync<City[]>('city_data_processed.json')).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
  const cityClinics: Practitioner[] = practitioners.filter(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
  const hasCityPractitioners = cityClinics.length > 0;
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
    .sort((left, right) => right.reviewCount - left.reviewCount || right.rating - left.rating)
    .slice(0, 6);
  const popularPractitioners = [...practitioners]
    .sort((left, right) => right.reviewCount - left.reviewCount || right.rating - left.rating)
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
