import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ItemsGrid from "@/components/collectionGrid";
import { MoreItems } from "@/components/MoreItems";
import type { Clinic, Practitioner } from "@/lib/types";
import { locations } from "@/lib/data";

type DiscoveryItem = Clinic | Practitioner;

interface EmptyCityStateProps {
  citySlug: string;
  pageLabel: "clinics" | "practitioners";
  popularClinics: Clinic[];
  popularPractitioners: DiscoveryItem[];
  popularTreatments: string[];
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

export function EmptyCityState({
  citySlug,
  pageLabel,
  popularClinics,
  popularPractitioners,
  popularTreatments,
}: Readonly<EmptyCityStateProps>) {
  const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  return (
    <div className="px-4 md:px-0 space-y-8">
      <Card className="border-dashed bg-white">
        <CardHeader className="space-y-3">
          <h2 className="text-xl font-semibold">We do not have live listings in {cityName} yet</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            This page is still useful even before local profiles go live. You can explore the most
            reviewed providers, popular treatment pages, UK city hubs, and recent guides while we
            expand coverage for {cityName}.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href={pageLabel === "clinics" ? "/directory/practitioners" : "/directory/clinics"} prefetch={false}>
            <Button variant="outline">
              {pageLabel === "clinics" ? "Browse practitioners" : "Browse clinics"}
            </Button>
          </Link>
          <Link href="/directory/treatments" prefetch={false}>
            <Button variant="outline">Browse treatments</Button>
          </Link>
          <Link href="/directory/search" prefetch={false}>
            <Button>Search the directory</Button>
          </Link>
        </CardContent>
      </Card>

      {popularClinics.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Highest reviewed clinics right now</h3>
          <ItemsGrid items={popularClinics} />
        </section>
      )}

      {popularPractitioners.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Popular practitioners right now</h3>
          <ItemsGrid items={popularPractitioners} />
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Most popular treatment pages</h3>
        <MoreItems items={popularTreatments} />
      </section>

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
  );
}