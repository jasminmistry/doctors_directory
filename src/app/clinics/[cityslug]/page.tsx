import Link from "next/link";
import type { Clinic, City,Practitioner } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react"
import  ItemsGrid  from "@/components/collectionGrid";
import { readJsonFileSync } from "@/lib/json-cache"
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { cityMap, locations } from "@/lib/data";
import { decodeUnicodeEscapes } from "@/lib/utils";
import { MoreItems } from "@/components/MoreItems";
import { CityPageData } from "@/components/cityPageData";
import { EmptyCityState } from "@/components/empty-city-state";
interface ProfilePageProps {
  params: {
    cityslug: string;
    slug: string;
  };
}

const clinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json');
const clinicIndex = new Map(
  clinics.filter((clinic) => clinic.slug !== undefined).map((clinic) => [clinic.slug!, clinic])
);
const practitionerDirectory: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');
const practitionerCards = practitionerDirectory
  .map((practitioner) => {
    try {
      const clinicSlug = JSON.parse(practitioner.Associated_Clinics || '[]')[0] as string | undefined;
      if (!clinicSlug) {
        return null;
      }

      const clinic = clinicIndex.get(clinicSlug);
      if (!clinic) {
        return null;
      }

      return {
        ...clinic,
        practitioner_name: practitioner.practitioner_name,
        practitioner_title: practitioner.practitioner_title,
        practitioner_qualifications: practitioner.practitioner_qualifications,
        practitioner_awards: practitioner.practitioner_awards,
      };
    } catch {
      return null;
    }
  })
  .filter((item) => item !== null);

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

export default function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const citySlug = params.cityslug;
  const normalizedCitySlug = decodeURIComponent(citySlug).toLowerCase();
  const cityClinics: Clinic[] = clinics.filter(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
  const cityData = (readJsonFileSync<City[]>('city_data_processed.json')).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  );
  const hasCityClinics = cityClinics.length > 0;
  const uniqueTreatments = [
  ...new Set(
    cityClinics
      .filter(c => Array.isArray(c.Treatments)).filter(c => c.Treatments !== undefined)
      .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
  )
];
  const defaultClinics: Clinic[] = clinics.filter((p) => p.City === "London");
  const popularClinics = [...clinics]
    .filter((clinic) => clinic.slug)
    .sort((left, right) => right.reviewCount - left.reviewCount || right.rating - left.rating)
    .slice(0, 6);
  const popularPractitioners = [...practitionerCards]
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
      <div className="sm:hidden">
        <CollectionsFilter pageType="Clinic" />
      </div>
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
                  <BreadcrumbPage>
                    {citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">Top Aesthetic Clinics in {citySlug}</h1>
          </div>

        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <div className="hidden sm:block">
            <CollectionsFilter pageType="Clinic" />
          </div>
          <div className="flex-1 min-w-0">
            {hasCityClinics ? (
              <ItemsGrid items={cityClinics} />
            ) : (
              <EmptyCityState
                citySlug={citySlug}
                pageLabel="clinics"
                popularClinics={popularClinics}
                popularPractitioners={popularPractitioners}
                popularTreatments={popularTreatments}
              />
            )}
          </div>
        </div>
        {/* City Overview */}

        {hasCityClinics && (
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
        {cityData && hasCityClinics && <CityPageData
          cityData={cityData}
          uniqueTreatments={uniqueTreatments as string[]}
          cityClinics={cityClinics}
          citySlug={citySlug}
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

export async function generateMetadata({ params }: ProfilePageProps) {
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://staging.consentz.com'
  const canonicalUrl = `${baseUrl}/directory/clinics/${citySlug}`;

  return {
    title: `List of Top Aesthetic Clinics in ${citySlug} - Healthcare Directory`,
    description: `Looking for the best aesthetic clinics in ${citySlug}? Browse our comprehensive guide to top-rated cosmetic clinics, read expert reviews, and book with confidence.`,
    alternates: {
      canonical: canonicalUrl,
    },
  }
}
