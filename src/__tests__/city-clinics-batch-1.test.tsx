import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Clinic } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { locations } from '@/lib/data';
import TestCityClinics from '@/components/test/testCityClinics';

const logFile = fs.createWriteStream('test-city-clinics-batch-1.log', { flags: 'w' });
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  logFile.write(args.join(' ') + '\n');
};

function testUlBullets(id:string, flag:boolean) {
  const element = screen.getByTestId(id);
  if (!element) {
    console.log(`${id} element not found.`);
    flag = false;
  }
  if(element.textContent.length> 0) {
    console.log(`${id} content: ${element.textContent}`);
    flag = true;
  }
  const lis = element.querySelectorAll('li');
  if (lis.length > 0) {
    flag = true;
  }
  console.log(`${id} bullets: ${lis.length} found.`);
  return flag;
}


describe('CityClinicsPage rendering', () => {

  test.each(locations)(
    'Page test: %s',
    async (cityslug) => {
      let renderFlag = false;
      let cardFlag = false;
      let populationFlag = false;
      let lifestyleFlag = false;
      let medical_infrastructureFlag = false;
      let numberofclinicsFlag = false;
      let totalReviewsFlag = false; 
      let averageRatingFlag = false;
      let marketMaturityLevelFlag = false;
      let treatmentsFlag = false;
      let primaryRegulatorFlag = false;
      let prescribingRequirementsFlag = false;
      let inspectionFrameworkFlag = false;
      let insuranceCoverageFlag = false;
      let cosmeticFinanceAvailabilityFlag = false;
      let peakBookingPeriodsFlag = false;
      let socialMediaTrendsFlag = false;
      let referralNetworksTeachingHospitalLinksFlag = false;
      let publicTransportProximityFlag = false;
      let parkingAvailabilityFlag = false;
      let cityCentreVsSuburbanDistributionFlag = false;
      let tourismVolumeIndicatorFlag = false;
      let hotelDensityNearClinicsFlag = false;
      let airportProximityFlag = false;
      let medicalTourismViabilityFlag = false;
      try {
        const { unmount } = render(await TestCityClinics({ params: { cityslug, slug: "123" } }));

        const ClinicsList = screen.getAllByTestId('practitioner-card');

        console.log(
          `/directory/clinics/${cityslug}: ${ClinicsList.length} cards found.`
        );

        renderFlag = true;
        cardFlag = ClinicsList.length > 0;
        populationFlag = testUlBullets('population-bullets', populationFlag);
        lifestyleFlag = testUlBullets('lifestyle-characteristics-bullets', lifestyleFlag);
        medical_infrastructureFlag = testUlBullets('medical-infrastructure-bullets', medical_infrastructureFlag);
        marketMaturityLevelFlag = testUlBullets('market-maturity-level', marketMaturityLevelFlag);
        primaryRegulatorFlag = testUlBullets('primary-regulator', primaryRegulatorFlag);
        prescribingRequirementsFlag = testUlBullets('prescribing-requirements', prescribingRequirementsFlag);
        inspectionFrameworkFlag = testUlBullets('inspection-framework', inspectionFrameworkFlag);
        insuranceCoverageFlag = testUlBullets('insurance-coverage', insuranceCoverageFlag);
        cosmeticFinanceAvailabilityFlag = testUlBullets('cosmetic-finance-availability', cosmeticFinanceAvailabilityFlag);
        referralNetworksTeachingHospitalLinksFlag = testUlBullets('referral-networks-teaching-hospital-links', referralNetworksTeachingHospitalLinksFlag);
        publicTransportProximityFlag = testUlBullets('public-transport-proximity', publicTransportProximityFlag);
        parkingAvailabilityFlag = testUlBullets('parking-availability', parkingAvailabilityFlag);
        cityCentreVsSuburbanDistributionFlag = testUlBullets('city-centre-vs-suburban-distribution', cityCentreVsSuburbanDistributionFlag);
        tourismVolumeIndicatorFlag = testUlBullets('tourism-volume-indicator', tourismVolumeIndicatorFlag);
        hotelDensityNearClinicsFlag = testUlBullets('hotel-density-near-clinics', hotelDensityNearClinicsFlag);
        airportProximityFlag = testUlBullets('airport-proximity', airportProximityFlag);
        medicalTourismViabilityFlag = testUlBullets('medical-tourism-viability', medicalTourismViabilityFlag);
        
        const numberOfClinics = screen.getByTestId('number-of-clinics');
        if (numberOfClinics) {
          numberofclinicsFlag = true;
        }
        console.log(`Number of clinics: ${numberOfClinics.textContent} found.`);
        const totalReviews = screen.getByTestId('total-reviews');
        if (totalReviews) {
          totalReviewsFlag = true;
        }
        console.log(`Total reviews: ${totalReviews.textContent} found.`);
        const averageRating = screen.getByTestId('average-rating');
        if (averageRating) {
          averageRatingFlag = true;
        }
        console.log(`Average rating: ${averageRating.textContent} found.`);
        
        try{
        const treatmentsList = screen.getAllByTestId('treatment-link');
        if(treatmentsList.length > 0) {
          treatmentsFlag = true;
        }
        console.log(`Treatments list: ${treatmentsList.length} found.`);
      } catch (e) {
        console.log(`Treatments list not found.`);
      }
    
        const peakBookingPeriods = screen.getAllByTestId('peak-booking-periods');
        console.log(`Peak booking periods elements found: ${peakBookingPeriods}`);
       

          
          if (peakBookingPeriods.length > 0) {
            peakBookingPeriodsFlag = true;
          }
        console.log(`Peak booking periods: ${peakBookingPeriods.length} found.`);
        const socialMediaTrends = screen.getAllByTestId('social-media-trends');
        if (socialMediaTrends.length > 0) {
          socialMediaTrendsFlag = true;
        } 
        console.log(`Social media trends: ${socialMediaTrends.length} found.`);

        
        unmount();

      } catch (e) {
        console.log(
          `Error at /directory/clinics/${cityslug}`
        );
      }
      const failures: string[] = [];
      if (!renderFlag) failures.push("Render failed");
      if (!cardFlag) failures.push("No cards found");
      if (!populationFlag) failures.push("Population overview bullets missing or empty");
      if (!lifestyleFlag) failures.push("Lifestyle characteristics bullets missing or empty");
      if (!medical_infrastructureFlag) failures.push("Medical infrastructure bullets missing or empty");
      if (!numberofclinicsFlag) failures.push("Number of clinics missing");
      if (!totalReviewsFlag) failures.push("Total reviews missing");
      if (!averageRatingFlag) failures.push("Average rating missing");
      if (!marketMaturityLevelFlag) failures.push("Market maturity level bullets missing or empty");
      if (!treatmentsFlag) failures.push("Treatments list missing or empty");
      if (!primaryRegulatorFlag) failures.push("Primary regulator list missing or empty");
      if (!prescribingRequirementsFlag) failures.push("Prescribing requirements list missing or empty");
      if (!inspectionFrameworkFlag) failures.push("Inspection framework list missing or empty");
      if (!insuranceCoverageFlag) failures.push("Insurance coverage list missing or empty");
      if (!cosmeticFinanceAvailabilityFlag) failures.push("Cosmetic finance availability list missing or empty");
      if (!peakBookingPeriodsFlag) failures.push("Peak booking periods list missing or empty");
      if (!socialMediaTrendsFlag) failures.push("Social media trends list missing or empty");
      if (!referralNetworksTeachingHospitalLinksFlag) failures.push("Referral networks/teaching hospital links list missing or empty");
      if (!publicTransportProximityFlag) failures.push("Public transport proximity list missing or empty");
      if (!parkingAvailabilityFlag) failures.push("Parking availability list missing or empty");
      if (!cityCentreVsSuburbanDistributionFlag) failures.push("City centre vs suburban distribution list missing or empty");
      if (!tourismVolumeIndicatorFlag) failures.push("Tourism volume indicator list missing or empty");
      if (!hotelDensityNearClinicsFlag) failures.push("Hotel density near clinics list missing or empty");
      if (!airportProximityFlag) failures.push("Airport proximity list missing or empty");  
      if (!medicalTourismViabilityFlag) failures.push("Medical tourism viability list missing or empty");

      if (failures.length > 0) {
        throw new Error(
          `\n/directory/clinics/${cityslug} failed:\n` +
          failures.map(f => ` - ${f}`).join("\n")
        );
      }
    }
  );

});
