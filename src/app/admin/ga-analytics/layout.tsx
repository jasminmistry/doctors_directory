import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "GA4 analytics",
  robots: { index: false, follow: false },
}

export default function GaAnalyticsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}
