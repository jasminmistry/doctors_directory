import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClinicTabs from "@/components/Clinic/clinicTabs";
import { 
  ProfileHeaderSkeleton, 
  ContentSectionsSkeleton, 
  SidebarSkeleton, 
  ReviewsSkeleton,
  BreadcrumbSkeleton
} from "@/components/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Loading({ params }: { params: { cityslug: string; slug: string } }) {

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
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
        </div>
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <BreadcrumbSkeleton
            items={[
              { label: "Home", href: "/" },
              { label: "Clinics", href: "/clinics" },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        <ProfileHeaderSkeleton />

        <div className="px-4 md:px-0">
          <ClinicTabs />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 mb-4">
            <ContentSectionsSkeleton />
            <SidebarSkeleton />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-col sm:flex-row gap-2">
              <ReviewsSkeleton />

              <div className="w-full sm:w-80">
                <Skeleton className="w-full h-80 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
