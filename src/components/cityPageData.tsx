import { City, Practitioner } from "@/lib/types";
import { capitalize, decodeUnicodeEscapes, fixMojibake, toUrlSlug } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
function createBullets(text: unknown) {
  const normalizedText = Array.isArray(text)
    ? text.filter((item): item is string => typeof item === "string").join("; ")
    : typeof text === "string"
      ? text
      : "";

  if (!normalizedText.trim()) {
    return null;
  }

  const splitText = normalizedText
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  if (splitText.length <= 1) {
    return decodeUnicodeEscapes(normalizedText);
  }

  return (
    <div className='mt-2 space-y-2'>
      <ul className="list-disc list-inside pl-6 space-y-1">
        {splitText.map((item, key) => {
          const cleanedItem = decodeUnicodeEscapes(
            fixMojibake(fixMojibake(fixMojibake(item)))
          );

          return (
            <li className="text-sm leading-relaxed" key={key}>
              {cleanedItem.trim().charAt(0).toUpperCase() + cleanedItem.trim().slice(1)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
type CityPageDataProps = {
    citySlug: string,cityData: City, cityClinics: Practitioner[], uniqueTreatments: string[]
}
export function CityPageData({citySlug, cityData, uniqueTreatments}: CityPageDataProps) {
  const cityName = capitalize(citySlug);
    return (
        <>
        <div className='bg-white rounded rounded-lg p-4 mb-4 mt-4'>
        <section className="mb-8">
    <h2 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">About {cityName}</h2>
        <section className="space-y-6 text-muted-foreground">
  {/* Overview Section */}
  <div>


    <div className="mt-2 space-y-2">
      <div>
        <strong><h3>Population:</h3></strong>
      </div>
      <ul className="list-disc list-inside" data-testid="population-bullets">
        {createBullets(cityData.city_overview_population_estimate)}
      </ul>

      <div>
        <strong><h3>Lifestyle Characteristics:</h3></strong>
      </div>
      <ul className="list-disc list-inside" data-testid="lifestyle-characteristics-bullets">
        {createBullets(cityData.city_overview_lifestyle_characteristics)}
      </ul>

      <div>
        <strong><h3>Medical Infrastructure:</h3></strong>
      </div>
      <ul className="list-disc list-inside" data-testid="medical-infrastructure-bullets">
        {createBullets(cityData.city_overview_medical_infrastructure_presence)}
      </ul>
    </div>
  </div>

  
</section>
      </section>

      {/* Market Size & Competitive Landscape */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Market Size
        </h2>

        <div className="space-y-3 text-muted-foreground">
          <div data-testid="number-of-clinics">
            <strong><h3>Number of Clinics:</h3></strong>{" "}
            {cityData.market_size_indicators_number_of_clinics}
          </div>
          <div data-testid="total-reviews">
            <strong><h3>Total Reviews:</h3></strong>{" "}
            {cityData.market_size_indicators_review_volume_total}
          </div>
          <div data-testid="average-rating">
            <strong><h3>Average Citywide Rating:</h3></strong>{" "}
            {cityData.market_size_indicators_average_rating_citywide}
          </div>
         
          <div className="mt-2 space-y-2" data-testid="market-maturity-level">

  
        {createBullets(cityData.beauty_spend_indicators_market_maturity_level)}
     

      
    </div>
        </div>
        
        <div>


    
  </div>
      </section>

      {/* Specializations */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Treatments
        </h2>
        <div className="flex flex-wrap gap-1">
          {uniqueTreatments &&
            uniqueTreatments.map(
              (modality, index) => 
                { 
                  const treatments = modality?.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                  
                  return (
                  
                <Link data-testid="treatment-link" key={modality} href={`/treatments/${toUrlSlug(modality)}`}>
                  <Badge variant="outline" className="text-md bg-gray-100 border-0">
                    {treatments}
                  </Badge>
                </Link> )}
              
            )}
        </div>
      </section>

      {/* Regulatory Environment */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Regulatory & Compliance Environment
        </h2>

        <div className="space-y-3 text-muted-foreground">
          <div data-testid="primary-regulator">
            <strong><h3>Primary Regulator:</h3></strong>{" "}
            {createBullets(cityData.regulatory_environment_primary_regulator)}
          </div>
          <div data-testid="prescribing-requirements">
            <strong><h3>Prescribing Requirements:</h3></strong>{" "}
            {createBullets(cityData.regulatory_environment_prescribing_requirements)}
          </div>
          <div data-testid="inspection-framework">
            <strong><h3>Inspection Framework:</h3></strong>{" "}
            {createBullets(cityData.regulatory_environment_inspection_framework)}
          </div>
        </div>
      </section>

      {/* Insurance & Financing */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Insurance & Financing
        </h2>

        <div className="space-y-3 text-muted-foreground">
          <div data-testid="insurance-coverage">
            <strong><h3>Private Insurance Usage:</h3></strong>{" "}
            {createBullets(cityData.insurance_and_financing_private_insurance_usage)}
          </div>
          <div data-testid="cosmetic-finance-availability">
            <strong><h3>Cosmetic Finance Availability:</h3></strong>{" "}
            {createBullets(cityData.insurance_and_financing_cosmetic_finance_availability)}
          </div>
        </div>
      </section>

      {/* Seasonality & Trends */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Seasonality & Local Trends
        </h2>

        <div className="space-y-3 text-muted-foreground">
          <>
            <strong><h3>Peak Booking Periods:</h3></strong>{" "}
            {cityData.seasonality_and_local_trends_peak_booking_periods.map((period:string)=><span key={period} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded" data-testid="peak-booking-periods">{period}</span>)}
          </>
          <div >
            <strong><h3>Social Media Trends:</h3></strong>{" "}
            {cityData.social_media_trends_content_trends.map((period:string)=><span key={period} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded" data-testid="social-media-trends">{period}</span>)}
          </div>
        </div>
      </section>

      {/* Referral Networks */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Referral Networks & Teaching Hospital Links
        </h2>
        <div className='text-muted-foreground' data-testid="referral-networks-teaching-hospital-links">{createBullets(cityData.referral_networks_teaching_hospital_links)}</div>
      </section>

      {/* Accessibility */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Accessibility & Location Factors
        </h2>

        <div className="space-y-3 text-muted-foreground">
          <div data-testid="public-transport-proximity">
            <strong><h3>Public Transport Proximity:</h3></strong>{" "}
            
          </div>{createBullets(cityData.accessibility_factors_public_transport_proximity)}
          <div data-testid="parking-availability">
            <strong><h3>Parking Availability:</h3></strong>{" "}
            
          </div>{createBullets(cityData.accessibility_factors_parking_availability)}
          <div data-testid="city-centre-vs-suburban-distribution">
            <strong><h3>City Centre vs Suburban Distribution:</h3></strong>{" "}
            
          </div>{createBullets(cityData.accessibility_factors_city_centre_vs_suburban_distribution)}
        </div>
      </section>

      {/* Medical Tourism */}
      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          Medical Tourism Potential
        </h2>

        <div className="space-y-3 text-muted-foreground">
          <div data-testid="tourism-volume-indicator">
            <strong><h3>Tourism Volume Indicator:</h3></strong>{" "}
            
          </div>
          {createBullets(cityData.medical_tourism_potential_tourism_volume_indicator)}
          <div data-testid="hotel-density-near-clinics">
            <strong><h3>Hotel Density Near Clinics:</h3></strong>{" "}
            
          </div>
          {createBullets(cityData.medical_tourism_potential_hotel_density_near_clinics)}
          <div data-testid="airport-proximity">
            <strong><h3>Airport Proximity:</h3></strong>{" "}
            
          </div>
          {createBullets(cityData.medical_tourism_potential_airport_proximity)}
          <div data-testid="medical-tourism-viability">
            <strong><h3>Overall Medical Tourism Viability:</h3></strong>{" "}
            
          </div>
          {createBullets(cityData.medical_tourism_potential_medical_tourism_viability)}
        </div>
      </section></div>
        </>
    )
}