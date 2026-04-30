"use client"

import { Suspense } from "react"
import { MainSiteTrackingDashboard } from "@/components/admin/main-site-tracking-dashboard"

export default function MainSiteTrackingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading dashboard…</div>}>
      <MainSiteTrackingDashboard />
    </Suspense>
  )
}
