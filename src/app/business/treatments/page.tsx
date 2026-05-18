import type { Metadata } from "next"
import { HubTreatmentsIndexClient } from "@/components/b2b-hub/hub-treatments-index-client"
import { getDirectoryTreatmentBases } from "@/lib/b2b-hub/scaled-pages"
import {
  buildHubPageMetadata,
  hubTreatmentIndexMetaDescription,
  hubTreatmentIndexMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata"

export const metadata: Metadata = buildHubPageMetadata({
  title: hubTreatmentIndexMetaTitle(),
  description: hubTreatmentIndexMetaDescription(),
  canonicalPath: "/business/treatments/",
  ogType: "website",
})

export default function BusinessTreatmentIndexPage() {
  const treatments = getDirectoryTreatmentBases(8, 100)
  return <HubTreatmentsIndexClient treatments={treatments} />
}
