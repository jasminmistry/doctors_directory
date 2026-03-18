import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PractitionerTabs from "@/components/Practitioner/PractitionerTabs";
import { 
  ProfileHeaderSkeleton, 
  ContentSectionsSkeleton, 
  SidebarSkeleton, 
  ReviewsSkeleton 
} from "@/components/loading-skeleton";

export default async function Loading({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-10">
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
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        <ProfileHeaderSkeleton />

        <div className="px-4 md:px-0">
          <PractitionerTabs />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 mb-4">
            <ContentSectionsSkeleton />
            <SidebarSkeleton />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 mb-4">
            <ReviewsSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}