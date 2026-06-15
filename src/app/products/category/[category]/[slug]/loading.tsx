import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PractitionerTabs from "@/components/Product/ProductTabs";
import { ProfileHeaderSkeleton, BreadcrumbSkeleton } from "@/components/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Loading({ params }: { params: { category: string; slug: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link href="/" prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <BreadcrumbSkeleton
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { isLoading: true, skeletonWidth: "w-24" },
              { isLoading: true, skeletonWidth: "w-32" },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        <ProfileHeaderSkeleton />

        <div className="px-4 md:px-0">
          <PractitionerTabs />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="order-2 lg:order-1 col-span-1 lg:col-span-12 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}