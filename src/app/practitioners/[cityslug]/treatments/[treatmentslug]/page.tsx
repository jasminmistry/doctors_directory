import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Clinic, Practitioner, City } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PractitionerCard } from "@/components/practitioner-card";
import { CityTreatmentPage } from "@/components/cityxTreatmentPage";
import treatment_content from "@//../public/treatments.json";
import ItemsGrid from "@/components/collectionGrid";
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { readJsonFileSync } from "@/lib/json-cache"
import { MoreItems } from "@/components/MoreItems";
import { locations, modalities } from "@/lib/data";
import { capitalize, toUrlSlug } from "@/lib/utils";
import { BestRankedBlock } from "@/components/best-ranked-block";
import { buildPractitionerRankedEntries } from "@/lib/best-ranked";
import { toDirectoryCanonical } from "@/lib/seo";

type TreatmentSlug = keyof typeof treatment_content

const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
const clinics = clinicsData
const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)

const popularPages = [
  { label: "Top clinics in the UK", href: "/clinics" },
  { label: "Top practitioners in the UK", href: "/practitioners" },
  { label: "Browse all treatments", href: "/treatments" },
  { label: "Accredited clinics and practitioners", href: "/accredited" },
]

const blogLinks = [
  {
    title: "10 Best HIPAA Compliant Medical Spa Software in 2025",
    href: "https://www.consentz.com/hipaa-compliant-medical-spa-software",
  },
  {
    title: "Top 10 Clinical Data Management Software Solutions in the USA",
    href: "https://www.consentz.com/clinical-data-management-software",
  },
  {
    title: "Aesthetic Clinic Marketing: Complete Guide [2025]",
    href: "https://www.consentz.com/aesthetic-clinic-marketing",
  },
]

function getPopularTreatments(items: Clinic[]): string[] {
  const counts = new Map<string, number>()

  for (const clinic of items) {
    for (const treatment of clinic.Treatments ?? []) {
      counts.set(treatment, (counts.get(treatment) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 18)
    .map(([treatment]) => treatment)
}

interface ProfilePageProps {
  params: {
    cityslug: string;
   treatmentslug: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  
  const practitionerDirectory: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');

  const practitioners = practitionerDirectory
    .map((practitioner): Practitioner | null => {
      try {
        const clinicSlug = JSON.parse(practitioner.Associated_Clinics ?? "[]")[0] as string | undefined
        if (!clinicSlug) return null

        const clinic = clinicIndex.get(clinicSlug)
        if (!clinic) return null

        return {
          ...clinic,
          practitioner_name: practitioner.practitioner_name,
          practitioner_title: practitioner.practitioner_title,
          practitioner_qualifications: practitioner.practitioner_qualifications,
          practitioner_awards: practitioner.practitioner_awards,
        }
      } catch {
        return null
      }
    })
    .filter((item): item is Practitioner => item !== null)

  const { cityslug, treatmentslug } = params;
  const normalizedCitySlug = decodeURIComponent(cityslug).toLowerCase();
  const cityData: City = (readJsonFileSync<City[]>('city_data_processed.json')).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  )!;
   const decodedCitySlug = decodeURIComponent(cityslug)
  .toLowerCase()
  .replace(/\s+/g, "");
  const decodedTreatmentSlug = decodeURIComponent(treatmentslug)
  .toLowerCase()
  .replace(/[\s-]+/g, "");
  const cityDisplayName = capitalize(decodeURIComponent(cityslug));
  const treatmentDisplayName = capitalize(decodeURIComponent(treatmentslug));

  const filteredClinics = practitioners.filter((practitioner) => {
    // Filter by city
    const cityMatch = practitioner.City?.toLowerCase() === decodedCitySlug.toLowerCase();
    // Filter by offered service category
    const categories =
      practitioner.Treatments ?? [];
    
  


    const serviceMatch = categories.some(
      (cat: string) => cat.replaceAll(" ","").replaceAll("-","").toLowerCase() === decodedTreatmentSlug.replaceAll("%20","").toLowerCase()
    );


    return cityMatch && serviceMatch
  });
  const rankedPractitioners = buildPractitionerRankedEntries(filteredClinics, 5);

  const cityPractitioners = practitioners
    .filter((practitioner) => practitioner.City?.toLowerCase() === decodedCitySlug.toLowerCase())
    .sort(
      (left, right) =>
        (right.reviewCount ?? 0) - (left.reviewCount ?? 0) ||
        (right.rating ?? 0) - (left.rating ?? 0)
    )

  const nearbyPractitioners = cityPractitioners.slice(0, 6)

  const cityClinics = clinics
    .filter((clinic) => clinic.City?.toLowerCase() === decodedCitySlug.toLowerCase())
    .sort((left, right) => right.reviewCount - left.reviewCount || right.rating - left.rating)

  const nearbyClinics = cityClinics.slice(0, 6)

  const popularClinics = [...clinics]
    .filter((clinic) => clinic.slug)
    .sort((left, right) => right.reviewCount - left.reviewCount || right.rating - left.rating)
    .slice(0, 6)

  const highestReviewedClinic = cityClinics[0] ?? popularClinics[0]

  const popularTreatments = getPopularTreatments(clinics)

  const uniqueTreatments = [
    ...new Set(
      filteredClinics
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];

  const resolvedTreatmentName =
    modalities.find((name) => toUrlSlug(name) === treatmentslug) ??
    (() => {
      const decoded = treatmentslug.replaceAll('%20', ' ');
      return modalities.find((name) => name === decoded) ?? decoded;
    })();
  const treatmentSlug = resolvedTreatmentName.charAt(0).toUpperCase() + resolvedTreatmentName.slice(1);
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
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}`}>{cityDisplayName}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}/treatments/${treatmentslug}`}>{treatmentDisplayName}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
            <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
              Top {treatmentDisplayName} Providers in {cityDisplayName}
            </h1>
          </div>

          {filteredClinics.length > 0 && (
            <div className="px-4 md:px-0 pb-4">
              <BestRankedBlock
                title={`Best ${treatmentDisplayName} Practitioners in ${cityDisplayName}`}
                entries={rankedPractitioners}
              />
            </div>
          )}

        </div>
        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Practitioner" />
          <div className="flex-1 min-w-0">
            {filteredClinics.length > 0 ? (
              <ItemsGrid items={filteredClinics} />
            ) : (
              <div className="space-y-8 px-4 md:px-0">
                <Card className="border-dashed bg-white">
                  <CardHeader className="space-y-3">
                    <h2 className="text-xl font-semibold">No live listings for this treatment in {cityDisplayName} yet</h2>
                    <p className="text-sm text-muted-foreground max-w-3xl">
                      We do not have practitioner profiles for {resolvedTreatmentName} in {cityDisplayName} right now.
                      You can still discover nearby options, highest reviewed clinics, and high-intent pages below.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Link href={`/practitioners/${normalizedCitySlug}`} prefetch={false}>
                      <Button variant="outline">Browse practitioners in {cityDisplayName}</Button>
                    </Link>
                    <Link href={`/clinics/${normalizedCitySlug}`} prefetch={false}>
                      <Button variant="outline">Browse clinics in {cityDisplayName}</Button>
                    </Link>
                    <Link href="/search" prefetch={false}>
                      <Button>Search the directory</Button>
                    </Link>
                  </CardContent>
                </Card>

                {highestReviewedClinic && (
                  <Card className="bg-white">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-foreground">Highest reviewed clinic near {cityDisplayName}</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {capitalize(highestReviewedClinic.slug ?? "top clinic")} has {highestReviewedClinic.reviewCount} reviews and a {highestReviewedClinic.rating.toFixed(1)} average rating.
                      </p>
                      <Link
                        href={`/clinics/${highestReviewedClinic.City.toLowerCase()}/clinic/${highestReviewedClinic.slug}`}
                        prefetch={false}
                      >
                        <Button variant="outline">View clinic profile</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Nearest practitioners</h3>
                  <ItemsGrid
                    items={nearbyPractitioners.length > 0 ? nearbyPractitioners : cityPractitioners.slice(0, 6)}
                  />
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Nearest clinics</h3>
                  <ItemsGrid
                    items={nearbyClinics.length > 0 ? nearbyClinics : popularClinics}
                  />
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Most popular treatment pages</h3>
                  <MoreItems items={popularTreatments} />
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Most popular directory pages</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {popularPages.map((page) => (
                      <Link key={page.href} href={page.href} prefetch={false}>
                        <Card className="bg-white transition-colors hover:bg-neutral-50">
                          <CardContent className="py-4 text-sm font-medium">{page.label}</CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Latest blog guides</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    {blogLinks.map((blog) => (
                      <a
                        key={blog.href}
                        href={blog.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <Card className="h-full bg-white transition-colors hover:bg-neutral-50">
                          <CardContent className="py-4 text-sm font-medium">{blog.title}</CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
        <CityTreatmentPage
          cityData={cityData}
          treatment={treatment}
          slug={treatmentslug.replaceAll("%20", " ")}
        />
        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${cityDisplayName}`}</h3>
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

export async function generateMetadata({ params }: ProfilePageProps) {
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const treatmentSlug = decodeURIComponent(params.treatmentslug).toLowerCase();
  const displayCityName = capitalize(citySlug);
  const displayTreatmentName = capitalize(treatmentSlug);

  return {
    title: `${displayTreatmentName} Practitioners in ${displayCityName} - Healthcare Directory`,
    description: `Find practitioners offering ${displayTreatmentName} in ${displayCityName}. Compare profiles, expertise, and reviews.`,
    alternates: {
      canonical: toDirectoryCanonical(
        `/practitioners/${citySlug}/treatments/${treatmentSlug}`
      ),
    },
  };
}
