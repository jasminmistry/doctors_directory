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
import { SearchBar } from "@/components/search/search-bar";
import { CollectionsFilter } from "@/components/filters/collectionsFilterWrapper";
export default function TreatmentByCityPage() {
  
    return (
      <main className="bg-(--primary-bg-color)">
        <SearchBar />
        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 ">
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
                    <BreadcrumbPage>Treatment by City</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
            <CollectionsFilter pageType="Clinic" />
            <div className="flex-1 min-w-0">
              <ItemsGrid items={Object.keys(cityMap)} customLink={`/clinics`} />
            </div>
          </div>
        </div>
      </main>
    );
}
