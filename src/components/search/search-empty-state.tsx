import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreItems } from "@/components/MoreItems";
import { PractitionerCard } from "@/components/practitioner-card";
import { locations } from "@/lib/data";
import type { Clinic, Practitioner, Product } from "@/lib/types";

interface SearchDiscoveryData {
  suggestedClinics: Clinic[];
  suggestedPractitioners: Practitioner[];
  suggestedProducts: Product[];
  popularTreatments: string[];
}

interface SearchEmptyStateProps {
  query: string;
  resultType: string;
  discoveryData: SearchDiscoveryData | null;
}

const popularPages = [
  { label: "Top clinics in the UK", href: "/directory/clinics" },
  { label: "Top practitioners in the UK", href: "/directory/practitioners" },
  { label: "Browse all treatments", href: "/directory/treatments" },
  { label: "Accredited clinics and practitioners", href: "/directory/accredited" },
];

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
];

export function SearchEmptyState({
  query,
  resultType,
  discoveryData,
}: Readonly<SearchEmptyStateProps>) {
  const hasQuery = query.trim().length > 0;
  const isProductSearch = resultType === "Product";
  const isTreatmentSearch = resultType === "Treatments";
  const primaryLabel = isProductSearch
    ? "products"
    : isTreatmentSearch
      ? "treatment pages"
      : resultType.toLowerCase();

  return (
    <div className="col-span-1 md:col-span-9 space-y-8">
      <Card className="bg-white border-dashed">
        <CardHeader className="space-y-3">
          <h2 className="text-xl font-semibold">No exact {primaryLabel} matches yet</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {hasQuery
              ? `We could not find an exact match for "${query}". Instead of leaving this page empty, here are the strongest nearby discovery paths in the directory.`
              : `We could not find results for the current filters. Instead of leaving this page empty, here are the strongest discovery paths in the directory.`}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/directory/search" prefetch={false}>
            <Button variant="outline">Reset search</Button>
          </Link>
          <Link href="/directory/treatments" prefetch={false}>
            <Button variant="outline">Browse treatments</Button>
          </Link>
          <Link href="/directory/clinics" prefetch={false}>
            <Button>Browse all clinics</Button>
          </Link>
        </CardContent>
      </Card>

      {discoveryData && isProductSearch && discoveryData.suggestedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Popular products to explore</h3>
          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {discoveryData.suggestedProducts.map((product) => (
              <PractitionerCard key={product.slug} practitioner={product} />
            ))}
          </div>
        </section>
      )}

      {discoveryData && !isProductSearch && discoveryData.suggestedClinics.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Highest reviewed clinics right now</h3>
          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {discoveryData.suggestedClinics.map((clinic) => (
              <PractitionerCard key={clinic.slug} practitioner={clinic} />
            ))}
          </div>
        </section>
      )}

      {discoveryData && discoveryData.suggestedPractitioners.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isTreatmentSearch ? "Practitioners for related treatments" : "Relevant practitioners to explore"}
          </h3>
          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {discoveryData.suggestedPractitioners.map((practitioner) => (
              <PractitionerCard
                key={`${practitioner.practitioner_name}-${practitioner.practitioner_title}`}
                practitioner={practitioner}
              />
            ))}
          </div>
        </section>
      )}

      {discoveryData && discoveryData.popularTreatments.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isTreatmentSearch ? "Popular treatment pages right now" : "Most popular treatment pages"}
          </h3>
          <MoreItems items={discoveryData.popularTreatments} />
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Popular pages</h3>
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
        <h3 className="text-lg font-semibold text-foreground">Explore top UK cities</h3>
        <MoreItems items={locations} />
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Latest blog guides</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {blogLinks.map((blog) => (
            <a key={blog.href} href={blog.href} target="_blank" rel="noreferrer" className="block">
              <Card className="h-full bg-white transition-colors hover:bg-neutral-50">
                <CardContent className="py-4 text-sm font-medium">{blog.title}</CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}