import {
  getCityClinicsBySlug,
  getCityPractitionersBySlug,
} from "@/lib/data-access/city-listings"
import { CityHubListingsSection } from "@/components/treatment/city-hub-listings-section"

interface CityHubListingsLoaderProps {
  citySlug: string
  cityName: string
}

export async function CityHubListingsLoader({
  citySlug,
  cityName,
}: CityHubListingsLoaderProps) {
  const [clinics, practitioners] = await Promise.all([
    getCityClinicsBySlug(citySlug),
    getCityPractitionersBySlug(citySlug),
  ])

  return (
    <CityHubListingsSection
      cityName={cityName}
      clinics={clinics}
      practitioners={practitioners}
    />
  )
}
