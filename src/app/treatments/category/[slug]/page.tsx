import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import treatmentContent from "../../../../../public/treatments.json";
import {
  getTreatmentCategory,
  getTreatmentCategoryFromSlug,
  getTreatmentCategorySlug,
  treatmentCategoryLabels,
} from "@/lib/treatment-categories";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PractitionerCard } from "@/components/practitioner-card";
import { toDirectoryCanonical } from "@/lib/seo";
import { IconArrowNarrowLeft } from "@tabler/icons-react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const allTreatmentNames = Object.keys(treatmentContent as Record<string, unknown>);

const getCategoryTreatments = (categoryLabel: string) => {
  return allTreatmentNames
    .filter((name) => getTreatmentCategory(name) === categoryLabel)
    .sort((a, b) => a.localeCompare(b));
};

export function generateStaticParams() {
  return treatmentCategoryLabels.map((label) => ({
    slug: getTreatmentCategorySlug(label),
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryLabel = getTreatmentCategoryFromSlug(params.slug);
  const canonicalSlug = decodeURIComponent(params.slug).toLowerCase();
  const canonicalUrl = toDirectoryCanonical(`/treatments/category/${canonicalSlug}`);

  if (!categoryLabel) {
    return {
      title: "Aesthetic Treatments Guide - Prices, Reviews & Book",
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: `Top ${categoryLabel} Treatments - Reviews, Prices & Booking`,
    description: `Browse top rated ${categoryLabel.toLowerCase()} treatments. Compare practitioners, prices and book with confidence.`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function TreatmentCategoryPage({ params }: Readonly<CategoryPageProps>) {
  const categoryLabel = getTreatmentCategoryFromSlug(params.slug);

  if (!categoryLabel) {
    notFound();
  }

  const treatments = getCategoryTreatments(categoryLabel);

  return (
    <main className="min-h-screen bg-[#fbfbfb]">
      <div className="bg-white backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-0 py-2">
          <Link href="/treatments" prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
            >
              <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
              Back to Treatments
            </Button>
          </Link>
        
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/treatments">Treatments</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <section className="pt-2 py-10 md:px-4 bg-white">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="m-0 md:mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{categoryLabel}</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Explore {treatments.length} treatment{treatments.length === 1 ? "" : "s"} in this
              category.
            </p>
          </div>

          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {treatments.map((treatmentName) => (
              <PractitionerCard key={treatmentName} practitioner={treatmentName} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}