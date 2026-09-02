import { NextRequest, NextResponse } from "next/server"

import { getGaDashboard } from "@/lib/analytics/ga-dashboard"
import { isGa4Configured } from "@/lib/analytics/ga-data-api"

export const dynamic = "force-dynamic"

const RANGE_PRESETS: Record<string, { startDate: string; endDate: string }> = {
  "7d": { startDate: "7daysAgo", endDate: "today" },
  "28d": { startDate: "28daysAgo", endDate: "today" },
  "90d": { startDate: "90daysAgo", endDate: "today" },
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

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
