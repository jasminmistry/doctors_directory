"use client"

import { Suspense } from "react"
import { TrackingDashboard } from "@/components/admin/tracking-dashboard"

export const dynamic = 'force-dynamic'

export default function TrackingAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading dashboard…</div>}>
      <TrackingDashboard />
    </Suspense>
  )
}
