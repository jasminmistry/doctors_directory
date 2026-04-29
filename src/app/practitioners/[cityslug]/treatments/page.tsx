import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Clinic, City, Practitioner } from "@/lib/types";
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
import ItemsGrid from "@/components/collectionGrid";
import { MoreItems } from "@/components/MoreItems";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { readJsonFileSync } from "@/lib/json-cache"
import { locations } from "@/lib/data";
import { capitalize } from "@/lib/utils";
import { toDirectoryCanonical } from "@/lib/seo";

interface PageProps {
  params: {
    cityslug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const displayCityName = capitalize(citySlug);

  return {
    title: `Top Aesthetic Treatments in ${displayCityName} - Compare Practitioners & Book`,
    description: `Find top rated aesthetic practitioners and treatments in ${displayCityName}. Compare expertise, reviews and book your consultation today.`,
    alternates: {
      canonical: toDirectoryCanonical(`/practitioners/${citySlug}/treatments`),
    },
  };
}

export default function CityTreatmentsPage({ params }: PageProps) {
  const clinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json');
  const practitioners: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');
  const products: Array<{ product_category: string; category: string }> = readJsonFileSync('products_processed_new.json');

  const { cityslug } = params;
  const displayCityName = capitalize(cityslug);
  const normalizedCitySlug = decodeURIComponent(cityslug).toLowerCase();
  const cityData: City = (readJsonFileSync<City[]>('city_data_processed.json')).find(
    (p) => p.City?.toLowerCase() === normalizedCitySlug
  )!;
  const decodedCitySlug = decodeURIComponent(cityslug)
    .toLowerCase()
    .replace(/\s+/g, "");

  const aestheticInjectableProducts = products.filter(p => p.category === "Aesthetic Injectables");
  const aestheticProductCategories = [...new Set(aestheticInjectableProducts.map(p => p.product_category.toLowerCase()))];

  const clinicIndex = new Map(
    clinics.filter(c => c.slug !== undefined).map(c => [c.slug!, c])
  );

  const enrichedPractitioners = practitioners
    .map(p => {
      try {
        const clinicSlugs = JSON.parse(p.Associated_Clinics || '[]') as string[];
        const clinicSlug = clinicSlugs?.[0];
        if (!clinicSlug) return null;
        const clinic = clinicIndex.get(clinicSlug);
        if (!clinic) return null;
        return {
          ...clinic,
          practitioner_name: p.practitioner_name,
          practitioner_title: p.practitioner_title,
          practitioner_qualifications: p.practitioner_qualifications,
          practitioner_awards: p.practitioner_awards,
        };
      } catch (error) {
        console.error('Failed to parse Associated_Clinics:', p.Associated_Clinics, error);
        return null;
      }
    })
    .filter(Boolean);

  const filteredPractitioners = (enrichedPractitioners as Array<Clinic & { practitioner_name: string; practitioner_title: string }>).filter((practitioner) => {
    const cityMatch = practitioner.City?.toLowerCase() === decodedCitySlug.toLowerCase();
    const treatments = practitioner.Treatments ?? [];

    const aestheticMatch = treatments.some((treatment: string) => {
      const treatmentLower = treatment.toLowerCase().replace(/\s+/g, "");
      return aestheticProductCategories.some(productCat =>
        treatmentLower.includes(productCat.replace(/\s+/g, "")) ||
        productCat.replace(/\s+/g, "").includes(treatmentLower)
      );
    });

    return cityMatch && aestheticMatch;
  });

  const uniqueTreatments = [
    ...new Set(
      filteredPractitioners
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];

  const defaultPractitioners = (enrichedPractitioners as Array<Clinic & { practitioner_name: string; practitioner_title: string }>).filter(p => p.City === "London" && p.Treatments?.some((t: string) => {
    const treatmentLower = t.toLowerCase().replace(/\s+/g, "");
    return aestheticProductCategories.some(productCat =>
      treatmentLower.includes(productCat.replace(/\s+/g, "")) ||
      productCat.replace(/\s+/g, "").includes(treatmentLower)
    );
  }));

  const defaultTreatments = [
    ...new Set(
      defaultPractitioners
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments || []).filter((t): t is string => typeof t === "string")
    )
  ];

  if (!cityData) {
    notFound();
  }

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
                    All Practitioners
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/directory/practitioners/${normalizedCitySlug}`}>{displayCityName}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    Aesthetic Injectables Treatments
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            Aesthetic Injectables Practitioners in {displayCityName}
          </h1>
        </div>

        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Treatments" />
          <div className="flex-1 min-w-0">
            <ItemsGrid items={uniqueTreatments.length === 0 ? defaultTreatments : uniqueTreatments} customLink={`/practitioners/${normalizedCitySlug}/treatments`} />
          </div>
        </div>
      </div>
    </main>
  );
}
