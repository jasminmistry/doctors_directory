'use client'

import nextDynamic from 'next/dynamic'

export function MainSiteTrackingFallback() {
  return (
    <div className="min-h-[40vh] bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
      Loading dashboard…
    </div>
  )
}

// `ssr: false` is only allowed inside Client Components from Next 15 onward.
export const MainSiteTrackingDashboardClient = nextDynamic(
  () =>
    import('@/components/admin/main-site-tracking-dashboard').then((mod) => ({
      default: mod.MainSiteTrackingDashboard,
    })),
  { ssr: false, loading: MainSiteTrackingFallback },
)
