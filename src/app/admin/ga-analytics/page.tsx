import nextDynamic from "next/dynamic"
import { Suspense } from "react"

function Fallback() {
  return (
    <div className="min-h-[40vh] bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
      Loading GA4 analytics…
    </div>
  )
}

const GaAnalyticsDashboard = nextDynamic(
  () =>
    import("@/components/admin/ga-analytics-dashboard").then((mod) => ({
      default: mod.GaAnalyticsDashboard,
    })),
  { ssr: false, loading: Fallback },
)

export const dynamic = "force-dynamic"

export default function GaAnalyticsPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <GaAnalyticsDashboard />
    </Suspense>
  )
}
