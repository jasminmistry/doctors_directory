import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Main site tracking",
  robots: { index: false, follow: false },
}

export default function MainSiteTrackingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children
}
