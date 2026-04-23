import { NextRequest, NextResponse } from "next/server"
import { listTrackingRows, type TrackingTab } from "@/lib/tracking/dashboard-queries"
import { trackingDashboardTokenOk } from "@/lib/tracking/mariadb-pool"

function parseTab(value: string | null): TrackingTab {
  return value === "leads" ? "leads" : "events"
}

function parseIntParam(value: string | null, fallback: number, max: number): number {
  const n = Number.parseInt(value || "", 10)
  if (Number.isNaN(n) || n < 1) return fallback
  return Math.min(max, n)
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!trackingDashboardTokenOk(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sp = request.nextUrl.searchParams
  const tab = parseTab(sp.get("tab"))
  const q = sp.get("q") ?? ""
  const pageType = sp.get("page_type") ?? ""
  const country = sp.get("country") ?? ""
  const deviceType = sp.get("device_type") ?? ""
  const from = sp.get("from") ?? ""
  const to = sp.get("to") ?? ""
  const page = parseIntParam(sp.get("page"), 1, 10_000)
  const pageSize = parseIntParam(sp.get("page_size"), 25, 100)

  try {
    const { rows, total } = await listTrackingRows({
      tab,
      q,
      pageType,
      country,
      deviceType,
      from,
      to,
      page,
      pageSize,
    })

    return NextResponse.json({
      tab,
      rows,
      total,
      page,
      page_size: pageSize,
    })
  } catch (error) {
    console.error("[tracking dashboard] query failed:", error)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }
}
