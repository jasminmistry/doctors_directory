import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Clinic, Practitioner } from "@/lib/types";
import { getAccreditationImages } from "@/lib/utils";
import { readJsonFileSync } from "@/lib/json-cache";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)

export default async function ProfilePage() {
  const practitionersData: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');
  const accreditationsJson = readJsonFileSync('accreditations_processed_new.json');
  const recognitionsWithImages = getAccreditationImages(accreditationsJson);
  
  const practitioners = practitionersData
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
    .filter((item) => item !== null).filter(Boolean)

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
                  <BreadcrumbLink href="/directory/practitioners">Practitioners</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Credentialed Providers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <h1 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
            Credentialed Practitioners
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Browse healthcare practitioners by recognized professional credentials and qualifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          {recognitionsWithImages.map((credential) => {
            const credentialSlug = credential.slug.toLowerCase().replace(/[\s-]/g, "");
            
            const practitionerCount = practitioners.filter(p => {
              if (!p) return false;
              const qualifications = p.practitioner_qualifications?.toLowerCase().replace(/[\s-]/g, "") || "";
              const awards = p.practitioner_awards?.toLowerCase().replace(/[\s-]/g, "") || "";
              return qualifications.includes(credentialSlug) || awards.includes(credentialSlug);
            }).length;

            // Only show credentials that have practitioners
            if (practitionerCount === 0) return null;

            return (
              <Card 
                key={credential.slug} 
                className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border-0 md:border-(--alto) cursor-pointer hover:shadow-lg"
              >
                <div className="relative w-full h-36 overflow-hidden rounded-t-md bg-white">
                  <img
                    src={credential.image_url}
                    alt={credential.name}
                    className="h-full w-full object-contain p-4"
                    loading="lazy"
                  />
                </div>
                <CardHeader className="pb-4">
                  <h3 className="mb-2 flex font-semibold text-md md:text-lg transition-colors text-balance group-hover:text-black">
                    {credential.name}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Browse practitioners with {credential.name} credentials.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {practitionerCount} Practitioner{practitionerCount !== 1 ? 's' : ''}
                      </span>
                      <Link href={`/practitioners/credentials/${encodeURIComponent(credential.name.toLowerCase())}`}>
                        <Button variant="outline" size="sm" className="cursor-pointer">
                          View Practitioners
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }).filter(Boolean)}
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata() {
  return {
    title: 'Credentialed Practitioners - Healthcare Directory',
    description: 'Find healthcare practitioners by professional credentials and qualifications. Browse medical degrees, certifications, and specializations. Compare ratings, reviews, and book appointments.',
    openGraph: {
      title: 'Credentialed Practitioners - Healthcare Directory',
      description: 'Find healthcare practitioners by professional credentials and qualifications.',
    }
  }
}
