import { Skeleton } from "@/components/ui/skeleton";
import { PractitionerCardSkeleton } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <main className="bg-(--primary-bg-color)">
      <div className="mx-auto max-w-6xl md:px-4 py-4 md:py-12">
        <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-7 w-64 mb-4" />
        </div>

        <div className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 flex flex-col sm:flex-row justify-center w-full md:gap-10">
          <div className="hidden sm:block w-48 shrink-0">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="flex-1 min-w-0 grid md:gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
            {Array.from({ length: 9 }).map((_, i) => (
              <PractitionerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
