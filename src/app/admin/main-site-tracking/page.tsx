import { Suspense } from 'react'

import { MainSiteTrackingDashboardClient, MainSiteTrackingFallback } from './main-site-tracking-client'

export const dynamic = 'force-dynamic'

export default function MainSiteTrackingPage() {
  return (
    <Suspense fallback={<MainSiteTrackingFallback />}>
      <MainSiteTrackingDashboardClient />
    </Suspense>
  )
}
