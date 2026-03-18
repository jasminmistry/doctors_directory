import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { 
  TreatmentHeroSkeleton, 
  TreatmentStatsSkeleton, 
  TreatmentContentSkeleton,
  BreadcrumbSkeleton
} from "@/components/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Loading({ params }: { params: { slug: string } }) {
  return (
    <main className="bg-[var(--primary-bg-color)]">
      <div className="bg-white">
        <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto max-w-7xl px-4 py-4">
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
            <BreadcrumbSkeleton
              items={[
                { label: "Home", href: "/" },
                { label: "Treatments", href: "/directory/treatments" },
                { isLoading: true, skeletonWidth: "w-20" },
                { isLoading: true, skeletonWidth: "w-32" },
              ]}
            />
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8">
          <TreatmentHeroSkeleton />
          <TreatmentStatsSkeleton />

          <div className="space-y-6">
            <div className="flex gap-4 border-b">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>

            <TreatmentContentSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}