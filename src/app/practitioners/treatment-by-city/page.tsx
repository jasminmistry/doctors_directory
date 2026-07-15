import Link from "next/link"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
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
import {cityMap} from "@/lib/data"
import ItemsGrid from "@/components/collectionGrid"
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
import { getPractitionerDirectoryRobots } from "@/lib/practitioner-profile-robots";
import { toDirectoryCanonical } from "@/lib/seo";

const robots = getPractitionerDirectoryRobots();

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/practitioners/treatment-by-city"),
  },
  ...(robots ? { robots } : {}),
};

export default function TreatmentByCityPage() {
  
    return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl md:px-4 pb-4 pt-4 md:pb-7">
        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0 md:pt-0 md:border-0 border-b border-[#C4C4C4]">
          <div className="sticky top-0 z-10">
            <Link className="mb-3 inline-block" href="/" prefetch={false}>
              <Button variant="ghost" size="sm" className="gap-2 hover:cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/practitioners">All Practitioners</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Treatment by City</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
         </div>

        <div className="mx-auto max-w-7xl md:px-4 pb-4 pt-4 md:pb-7flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <CollectionsFilter pageType="Practitioner" />
          <div className="flex-1 min-w-0">
            <ItemsGrid 
              items={Object.keys(cityMap)} 
              customLink={`/practitioners`}
              
            />
          </div>
        </div>
        </div>
        </main>
    )
}