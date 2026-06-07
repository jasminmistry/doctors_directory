const BRAND = 'Consentz'

export const buildTreatmentCityHubPageTitle = (
  treatmentName: string,
  locationLabel: string,
  clinicCount: number
): string =>
  `${treatmentName} in ${locationLabel} - Compare ${clinicCount} Clinics and Book Online`

export const buildBestInCityPageTitle = (
  treatmentName: string,
  locationLabel: string,
  clinicCount: number
): string =>
  `Best ${treatmentName} Clinics in ${locationLabel} - ${clinicCount} Verified Clinics - ${BRAND}`

export const buildServiceCityPageTitle = (
  serviceLabel: string,
  locationLabel: string,
  year = new Date().getFullYear()
): string => `Best ${serviceLabel} in ${locationLabel} (${year}) - Top-Rated`

export const buildServiceCityPageDescription = (
  serviceLabel: string,
  locationLabel: string
): string =>
  `Looking for the best ${serviceLabel} in ${locationLabel}? Compare top-rated clinics, read real customer reviews, and view pricing. Find your perfect spot today!`
