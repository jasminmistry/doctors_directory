import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Directory tracking",
  robots: { index: false, follow: false },
}

export default function TrackingAdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children
}
