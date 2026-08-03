import { PractitionerCardSkeleton } from "@/components/loading-skeleton";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResultsHeader } from "@/components/search/search-results-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sliders } from "lucide-react";
import Link from "next/link";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fbfbfb]">
      <div className="bg-white backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <Link href="/" prefetch={false} className="mb-4 inline-flex items-center gap-3 text-sm hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-[#C4C4C4]">
        <SearchBar />
      </div>

      <section className="pt-2 py-10 md:px-4 bg-white">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="m-0 md:mb-4"></div>
          <div className="grid grid-cols-1 md:gap-8 md:grid-cols-12">
            <div className="col-span-1 md:col-span-3"></div>

            {
              <div className="col-span-1 md:col-span-9">
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-4"
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <PractitionerCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  );
}
