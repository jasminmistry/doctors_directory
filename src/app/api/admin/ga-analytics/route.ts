import { NextRequest, NextResponse } from "next/server"

import { getGaDashboard } from "@/lib/analytics/ga-dashboard"
import { demoGaDashboard } from "@/lib/analytics/ga-dashboard-demo"
import { isGa4Configured } from "@/lib/analytics/ga-data-api"

export const dynamic = "force-dynamic"

const RANGE_PRESETS: Record<string, { startDate: string; endDate: string }> = {
  "7d": { startDate: "7daysAgo", endDate: "today" },
  "28d": { startDate: "28daysAgo", endDate: "today" },
  "90d": { startDate: "90daysAgo", endDate: "today" },
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function demoRangeDays(range: string | null, from: string | null, to: string | null): number {
  if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) {
    const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1
    return days > 0 && days <= 365 ? days : 28
  }
  if (range === "7d") return 7
  if (range === "90d") return 90
  return 28
}

// Access is already gated by middleware for every /api/admin/* route.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  let startDate = "28daysAgo"
  let endDate = "today"

  const preset = RANGE_PRESETS[sp.get("range") ?? ""]
  if (preset) {
    startDate = preset.startDate
    endDate = preset.endDate
  }
  const from = sp.get("from")
  const to = sp.get("to")
  if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) {
    startDate = from
    endDate = to
  }

  // `?demo=1` — synthetic sample data for showing the dashboard before GA4 is
  // connected. Admin-gated by middleware; the UI labels it clearly as sample data.
  if (sp.get("demo") === "1") {
    const days = demoRangeDays(sp.get("range"), from, to)
    return NextResponse.json({
      ...demoGaDashboard({ startDate, endDate, days }),
      demo: true,
    })
  }

  if (!isGa4Configured()) {
    return NextResponse.json({
      configured: false,
      range: { startDate, endDate },
      message:
        "GA4 is not configured. Set GA4_PROPERTY_ID and GA4_SA_CREDENTIALS (or reuse GSC_SERVICE_ACCOUNT_CREDENTIALS) and grant the service account Viewer on the GA4 property.",
    })
  }

  try {
    const data = await getGaDashboard({ startDate, endDate })
    return NextResponse.json(data)
  } catch (error) {
    console.error("[ga-analytics] report failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GA4 report failed" },
      { status: 502 },
    )
  }
}
