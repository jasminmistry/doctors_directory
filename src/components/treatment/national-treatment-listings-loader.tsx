import {
  getNationalTreatmentClinics,
  getNationalTreatmentPractitioners,
} from "@/lib/data-access/treatment-listings"
import { NationalTreatmentListingsSection } from "@/components/treatment/national-treatment-listings-section"

interface NationalTreatmentListingsLoaderProps {
  treatmentSlug: string
  treatmentName: string
}

export async function NationalTreatmentListingsLoader({
  treatmentSlug,
  treatmentName,
}: NationalTreatmentListingsLoaderProps) {
  const [clinics, practitioners] = await Promise.all([
    getNationalTreatmentClinics(treatmentSlug),
    getNationalTreatmentPractitioners(treatmentSlug),
  ])

  if (clinics.length === 0 && practitioners.length === 0) {
    return null
  }

  return (
    <NationalTreatmentListingsSection
      treatmentName={treatmentName}
      clinics={clinics}
      practitioners={practitioners}
    />
  )
}
