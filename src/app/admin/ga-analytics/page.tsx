import { Suspense } from "react"

import { GaAnalyticsDashboardClient, GaAnalyticsFallback } from "./ga-analytics-client"

export const dynamic = "force-dynamic"

export default function GaAnalyticsPage() {
  return (
    <Suspense fallback={<GaAnalyticsFallback />}>
      <GaAnalyticsDashboardClient />
    </Suspense>
  )
}
