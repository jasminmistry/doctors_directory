import nextDynamic from 'next/dynamic'
import { Suspense } from 'react'

function MainSiteTrackingFallback() {
  return (
    <div className="min-h-[40vh] bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
      Loading dashboard…
    </div>
  )
}

const MainSiteTrackingDashboardClient = nextDynamic(
  () =>
    import('@/components/admin/main-site-tracking-dashboard').then((mod) => ({
      default: mod.MainSiteTrackingDashboard,
    })),
  { ssr: false, loading: MainSiteTrackingFallback },
)

export const dynamic = 'force-dynamic'

export default function MainSiteTrackingPage() {
  return (
    <Suspense fallback={<MainSiteTrackingFallback />}>
      <MainSiteTrackingDashboardClient />
    </Suspense>
  )
}
