import { Suspense } from "react"
import HomePage from "@/components/home-page"
import FeaturedClinicsSection from "@/components/home/featured-clinics-section"
import { FeaturedClinicsSectionSkeleton } from "@/components/loading-skeleton"
import { toDirectoryCanonical } from "@/lib/seo"

export const dynamic = 'force-dynamic'

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/"),
  },
}

export default function Home() {
  return (
    <HomePage
      featuredSection={
        <Suspense fallback={<FeaturedClinicsSectionSkeleton />}>
          <FeaturedClinicsSection />
        </Suspense>
      }
    />
  )
}
