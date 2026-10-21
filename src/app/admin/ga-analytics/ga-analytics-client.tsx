"use client"

import nextDynamic from "next/dynamic"

function Fallback() {
  return (
    <div className="min-h-[40vh] bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
      Loading GA4 analytics…
    </div>
  )
}

// `ssr: false` is only allowed inside Client Components from Next 15 onward.
export const GaAnalyticsDashboardClient = nextDynamic(
  () =>
    import("@/components/admin/ga-analytics-dashboard").then((mod) => ({
      default: mod.GaAnalyticsDashboard,
    })),
  { ssr: false, loading: Fallback },
)

export { Fallback as GaAnalyticsFallback }
