import type { Metadata } from "next"
import { HubTreatmentsIndexClient } from "@/components/b2b-hub/hub-treatments-index-client"
import { getDirectoryTreatmentBases } from "@/lib/b2b-hub/scaled-pages"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"

export const metadata: Metadata = {
  metadataBase: new URL(b2bBaseUrl()),
  title: "Treatments | B2B Buyer Hub",
  description:
    "Treatment-based B2B pages connecting consent, automation, and software workflows.",
  alternates: {
    canonical: toCurrentSiteUrl("/business/treatments/"),
  },
  openGraph: {
    title: "Treatments | B2B Buyer Hub",
    description:
      "Treatment-based B2B pages connecting consent, automation, and software workflows.",
    type: "website",
    url: toCurrentSiteUrl("/business/treatments/"),
    images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Treatments | B2B Buyer Hub",
    description:
      "Treatment-based B2B pages connecting consent, automation, and software workflows.",
    images: [b2bOgImageUrl(["/images/Consentz Logo.webp"])],
  },
}

export default function BusinessTreatmentIndexPage() {
  const treatments = getDirectoryTreatmentBases(8, 40)
  return <HubTreatmentsIndexClient treatments={treatments} />
}
