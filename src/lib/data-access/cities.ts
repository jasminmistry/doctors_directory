import { prisma } from '@/lib/db'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { City as PrismaCity } from '@prisma/client'
import type { City } from '@/lib/types'

export function convertDbCityToOldType(city: PrismaCity): City {
  return {
    City: city.name,
    Unique_Specializations: (city.specializations as string[] | null) ?? [],

    city_overview_population_estimate: city.populationEstimate ?? '',
    city_overview_lifestyle_characteristics: city.lifestyleCharacteristics ?? '',
    city_overview_medical_infrastructure_presence: city.medicalInfrastructurePresence ?? '',

    market_size_indicators_number_of_clinics: city.numClinics ?? 0,
    market_size_indicators_review_volume_total: city.reviewVolumeTotal ?? 0,
    market_size_indicators_average_rating_citywide: city.averageRatingCitywide
      ? Number(city.averageRatingCitywide)
      : 0,
    market_size_indicators_estimated_private_aesthetic_market_strength:
      city.estimatedMarketStrength ?? '',

    competitor_landscape_nhs_presence: city.nhsPresence ?? '',

    regulatory_environment_primary_regulator: city.primaryRegulator ?? '',
    regulatory_environment_prescribing_requirements: city.prescribingRequirements ?? '',
    regulatory_environment_inspection_framework: city.inspectionFramework ?? '',

    insurance_and_financing_private_insurance_usage: city.privateInsuranceUsage ?? '',
    insurance_and_financing_cosmetic_finance_availability:
      city.cosmeticFinanceAvailability ?? '',

    seasonality_and_local_trends_peak_booking_periods:
      (city.peakBookingPeriods as string[] | null) ?? [],

    social_media_trends_content_trends: (city.socialMediaTrends as string[] | null) ?? [],

    referral_networks_teaching_hospital_links: city.teachingHospitalLinks ?? '',

    accessibility_factors_public_transport_proximity: city.publicTransportProximity ?? '',
    accessibility_factors_parking_availability: city.parkingAvailability ?? '',
    accessibility_factors_city_centre_vs_suburban_distribution:
      city.cityVsSuburbanDistribution ?? '',

    medical_tourism_potential_tourism_volume_indicator: city.tourismVolumeIndicator ?? '',
    medical_tourism_potential_hotel_density_near_clinics: city.hotelDensityNearClinics ?? '',
    medical_tourism_potential_airport_proximity: city.airportProximity ?? '',
    medical_tourism_potential_medical_tourism_viability: city.medicalTourismViability ?? '',

    beauty_spend_indicators_market_maturity_level: city.marketMaturityLevel ?? '',
  }
}

/**
 * All cities in the old JSON-record shape (cached). Replaces reads of
 * city_data_processed.json — callers keep the same "load all, then .find()"
 * pattern the JSON version used.
 */
export const getAllCitiesOldFormat = cache(
  unstable_cache(
    async (): Promise<City[]> => {
      const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })
      return cities.map(convertDbCityToOldType)
    },
    ['cities-all-old-format'],
    { revalidate: 300 }
  )
)
