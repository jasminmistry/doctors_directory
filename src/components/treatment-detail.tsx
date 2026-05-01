"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, DollarSign, Star, Clock, Users, Database, Camera } from "lucide-react";
import { DEFAULT_PERSON, FallbackImage } from "@/components/ui/fallback-image";

interface TreatmentDetailProps {
  treatment: {
    name: string;
    image: string;
    satisfaction: number;
    averageCost: string;
    reviews: number;
    downtime: string;
    practitioners: number;
  };
  treatmentData?: any;
}

export function TreatmentDetail({ treatment, treatmentData }: Readonly<TreatmentDetailProps>) {
  const findProperty = (baseProperty: string) => {
    if (!treatmentData) return null;
    
    const treatmentName = treatment.name;
    const treatmentNameUnderscore = treatmentName.replaceAll(/\s+/g, '_');
    
    const possibleKeys = [];
    
    switch (baseProperty) {
      case 'whatIs':
        possibleKeys.push(
          `What_is_${treatmentNameUnderscore}_How_does_it_work`,
          `What is ${treatmentName}? How does it work?`,
          `What is ${treatmentName} and How Does It Work?`,
          `What_is_${treatmentName}_How_does_it_work`,
          `What_is_${treatmentNameUnderscore}_How_does_it_work`
        );
        break;
      case 'goals':
        possibleKeys.push(
          `Goals_of_${treatmentNameUnderscore}_treatment`,
          `What are the goals of ${treatmentName}?`,
          `Goals_of_${treatmentName}_treatment`,
          `Goals of ${treatmentName}`,
          `Goals of ${treatmentName} Treatment`,
          `Goals_of_${treatmentNameUnderscore}`
        );
        break;
      case 'prosAndCons':
        possibleKeys.push(
          `Pros_and_Cons_of_${treatmentNameUnderscore}_Treatments`,
          `What are the pros and cons of ${treatmentName}?`,
          `Pros_and_Cons_of_${treatmentName}_Treatments`,
          `Pros and Cons of ${treatmentName}`,
          `Pros and Cons of ${treatmentName} Treatment`,
          `Pros_and_Cons_of_${treatmentNameUnderscore}`
        );
        break;
      case 'cost':
        possibleKeys.push(
          `Cost_of_${treatmentNameUnderscore}_in_UK_and_Variations`,
          `What is the cost of ${treatmentName} in the UK, and why does the price vary between clinics?`,
          `Cost_of_${treatmentName}_in_UK_and_Variations`,
          `What_is_the_cost_of_${treatmentNameUnderscore}_in_UK_and_Variations`,
          `Cost in the UK and Why It Varies`,
          `Cost in the UK and Why the price varies between clinics`,
          `Cost_of_${treatmentNameUnderscore}_in_the_UK_and_Why_it_Varies`
        );
        break;
      case 'choosing':
        possibleKeys.push(
          `What_to_Look_for_Choosing_Doctor_or_Clinic`,
          `What should you look for when choosing a doctor or clinic for ${treatmentName}?`,
          `What_to_Look_for_When_Choosing_Doctor_or_Clinic`,
          `What_should_you_look_for_when_choosing_a_doctor_or_clinic_for_${treatmentNameUnderscore}?`,
          `What to Look for When Choosing a Doctor or Clinic`,
          `Choosing a Doctor or Clinic`,
          `What_to_Look_for_When_Choosing_a_Doctor_or_Clinic`
        );
        break;
      case 'comparison':
        possibleKeys.push(
          `How_${treatmentNameUnderscore}_Compairs_with_Non_surgical_or_Alternative_Options`,
          `How does ${treatmentName} compare with non-surgical or alternative options?`,
          `How_${treatmentName}_Compairs_with_Non_surgical_or_Alternative_Options`,
          `How ${treatmentName} Compares with Non-Surgical or Alternative Options`,
          `How ${treatmentName} Treatment Compares with Non-Surgical or Alternative Options`,
          `How_${treatmentNameUnderscore}_Compares_with_Non_surgical_or_Alternative_Options`
        );
        break;
      case 'candidate':
        possibleKeys.push(
          `Who_is_a_Good_Candidate_for_${treatmentNameUnderscore}_Treatment`,
          `Who is a good candidate for ${treatmentName}?`,
          `Who_is_a_Good_Candidate_for_${treatmentName}_Treatment`,
          `Who is a Good Candidate?`,
          `Who_is_a_good_candidate_for_${treatmentNameUnderscore}_treatment?`,
          `Who is a Good Candidate for ${treatmentName}`,
          `Who is a Good Candidate for ${treatmentName} Treatment`,
          `Who_is_a_Good_Candidate_for_${treatmentNameUnderscore}`
        );
        break;
      case 'prepare':
        possibleKeys.push(
          `How_to_Prepare_for_${treatmentNameUnderscore}_Appointment`,
          `How should you prepare for ${treatmentName}?`,
          `How_to_Prepare_for_${treatmentName}_Appointment`,
          `How_should_you_prepare_for_${treatmentNameUnderscore}_treatment?`,
          `How to Prepare for ${treatmentName}`,
          `How to Prepare for ${treatmentName} Treatment`,
          `How_Should_You_Prepare_for_${treatmentNameUnderscore}`
        );
        break;
      case 'safety':
        possibleKeys.push(
          `Safety_Considerations_and_Pain`,
          `What are the safety considerations for ${treatmentName}? Is it painful?`,
          `Safety_Considerations_Is_it_painful`,
          `Safety considerations for ${treatmentName}: Is it painful?`,
          `Safety Considerations and Pain`,
          `Safety and Pain`,
          `Safety_Considerations_Is_it_Painful`,
          `Safety_Considerations_Is_it_Painful`
        );
        break;
      case 'duration':
        possibleKeys.push(
          `What_Happens_During_Appointment_and_Duration`,
          `What happens during a ${treatmentName} appointment, and how long does it take?`,
          `What_Happens_During_Appointment_and_How_Long`,
          `What_happens_during_a_${treatmentNameUnderscore}_appointment_and_how_long_does_it_take?`,
          `What Happens During an ${treatmentName} Appointment`,
          `What happens during an ${treatmentName} appointment and how long does it take?`,
          `What_Happens_During_a_${treatmentNameUnderscore}_and_How_Long_it_Takes`,
          `What_Happens_During_a_${treatmentNameUnderscore}_Appointment_and_How_Long_it_Takes`,
          `What_Happens_During_an_${treatmentNameUnderscore}_Appointment_and_How_Long_it_Takes`,
          `During a ${treatmentName} Treatment Appointment`,
          `During_a_${treatmentNameUnderscore}_Treatment_Appointment`,
          `What_Happens_During_an_${treatmentNameUnderscore}_Appointment_and_How_Long_it_Takes`
        );
        break;
      case 'recovery':
        possibleKeys.push(
          `Recovery_Process_Downtime_Possible_Side_Effects`,
          `What is the recovery process, downtime, and possible side effects of ${treatmentName}?`,
          `What_is_the_recovery_process,_downtime,_and_possible_side_effects_of_${treatmentNameUnderscore}_treatment?`,
          `Recovery, Downtime, and Possible Side Effects`,
          `Recovery, Downtime, Side Effects`,
          `Recovery_Downtime_and_Possible_Side_Effects`
        );
        break;
      case 'resultsLast':
        possibleKeys.push(
          `How_Long_Results_Last`,
          `How long do the results of ${treatmentName} last?`,
          `How_long_do_the_results_of_${treatmentNameUnderscore}_treatment_last?`,
          `Duration of Results`,
          `How long do results last?`,
          `How_Long_Do_the_Results_Last`
        );
        break;
      case 'mildVsSevere':
        possibleKeys.push(
          `Mild_vs_Severe_${treatmentNameUnderscore}_and_Limits`,
          `How does ${treatmentName} differ for mild versus severe cases, and what does it not treat?`,
          `Mild_vs_Severe_${treatmentName}_and_Limits`,
          `How_does_${treatmentNameUnderscore}_differ_for_mild_versus_severe_cases_and_what_does_it_not_treat?`,
          `How ${treatmentName} Differs for Mild Versus Severe Cases`,
          `Mild vs Severe Cases and What It Does Not Treat`
        );
        break;
      case 'maintenance':
        possibleKeys.push(
          `Does_${treatmentNameUnderscore}_Require_Maintenance_and_How_Often`,
          `Does ${treatmentName} require maintenance sessions? How often should it be repeated?`,
          `Does_${treatmentName}_Require_Maintenance_and_How_Often`,
          `Does_${treatmentNameUnderscore}_treatment_require_maintenance_sessions?_How_often?`,
          `Maintenance Sessions`,
          `Maintenance and Repeat Sessions`,
          `Does_${treatmentNameUnderscore}_Require_Maintenance_Sessions`,
          `Does_${treatmentNameUnderscore}_Require_Maintenance_and_How_Often`
        );
        break;
      case 'qualifications':
        possibleKeys.push(
          `Qualifications_Practitioner_Should_Have`,
          `What qualifications should a practitioner offering ${treatmentName} have?`,
          `What_qualifications_should_a_practitioner_offering_${treatmentNameUnderscore}_have`,
          `What_Qualifications_Should_a_Practitioner_Offering_${treatmentNameUnderscore}_Have`,
          `What_qualifications_should_a_practitioner_offering_${treatmentNameUnderscore}_treatment_have?`,
          `Practitioner Qualifications`,
          `Qualifications a practitioner offering ${treatmentName} should have`,
          `What_Qualifications_Should_a_Practitioner_Offering_${treatmentNameUnderscore}_Have`
        );
        break;
      case 'regulation':
        possibleKeys.push(
          `Is_${treatmentNameUnderscore}_Regulated_in_UK_and_What_To_Do_If_Something_Goes_Wrong`,
          `Is ${treatmentName} regulated in the UK, and what should you do if something goes wrong?`,
          `Is_${treatmentName}_Regulated_in_UK_and_What_to_Do_If_Something_Goes_Wrong`,
          `Is_${treatmentNameUnderscore}_Treatment_Regulated_in_the_UK_and_What_to_Do_if_Something_Goes_Wrong?`,
          `Is_${treatmentNameUnderscore}_regulated_in_the_UK,_and_what_should_you_do_if_something_goes_wrong?`,
          `Is ${treatmentName} Regulated in the UK and What to Do if Something Goes Wrong?`,
          `Regulation in the UK`,
          `Is_${treatmentNameUnderscore}_Regulated_in_the_UK_and_What_if_Something_Goes_Wrong`
        );
        break;
      case 'guidelines':
        possibleKeys.push(
          `Are_There_NICE_FDA_MHRA_Guidelines`,
          `Are_There_NICE_FDA_or_MHRA_Guidelines_for_${treatmentNameUnderscore}`,
          `Are there NICE, FDA, or MHRA guidelines for ${treatmentName}?`,
          `Are_there_NICE_FDA_or_MHRA_guidelines_for_${treatmentNameUnderscore}`,
          `Are_there_NICE,_FDA,_or_MHRA_guidelines_for_${treatmentNameUnderscore}?`,
          `Guidelines (NICE, FDA, or MHRA)`,
          `Guidelines (NICE / MHRA / FDA)`,
          `Are_There_NICE_FDA_or_MHRA_Guidelines_for_${treatmentNameUnderscore}`
        );
        break;
    }
    
    for (const key of possibleKeys) {
      if (treatmentData.hasOwnProperty(key)) {
        const value = treatmentData[key];
        
        if (typeof value === 'object' && value !== null) {
          if (baseProperty === 'whatIs') {
            return value.description || value.answer || value.technical || (typeof value === 'string' ? value : null);
          }
          else if (baseProperty === 'goals') {
            return value.goals || value.answer || value.typical || value.advice || (Array.isArray(value) ? value : null);
          }
          else if (baseProperty === 'prosAndCons') {
            return value;
          }
          else if (baseProperty === 'cost') {
            // Return the entire cost object for access to Typical_prices and Why_price_varies
            return value;
          }
          else if (baseProperty === 'candidate') {
            return value.typical || value.advice || value.answer || (Array.isArray(value) ? value : null);
          }
          else if (baseProperty === 'duration') {
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') return value;
            return value.duration || value.answer || value.process || value.description || null;
          }
          else if (baseProperty === 'comparison') {
            return value.comparison || value.answer || value.advice || (Array.isArray(value) ? value : null);
          }
          else if (baseProperty === 'resultsLast') {
            if (typeof value === 'string') return value;
            return value.duration || value.answer || value.typical || null;
          }
          else if (baseProperty === 'recovery') {
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') return value;
            return value.recovery || value.answer || value.process || null;
          }
          else if (baseProperty === 'maintenance') {
            if (typeof value === 'string') return value;
            if (Array.isArray(value)) return value;
            return value.maintenance || value.answer || value.typical || null;
          }
          else if (baseProperty === 'safety') {
            return value;
          }
          else if (baseProperty === 'guidelines') {
            return value;
          }
          else if (baseProperty === 'regulation') {
            return value;
          }
          return value.answer || value.description || value.typical || value.advice || value.notes || (typeof value === 'string' ? value : null);
        }
        
        return value;
      }
    }
    return null;
  };

  const getCostData = () => {
    const costData = findProperty('cost');
    if (!costData) return null;
    
    if (typeof costData === 'string') {
      return { typicalPrices: costData, whyVary: null };
    }
    
    if (Array.isArray(costData)) {
      return { typicalPrices: costData, whyVary: null };
    }
    
    return {
      typicalPrices: costData.Typical_prices || costData['Typical UK costs'] || costData.typicalCosts || costData.typical_costs || costData['Typical_Costs'] || costData.typicalRange || costData['Typical_Range'] || costData.Typical_Range,
      whyVary: costData.Why_price_varies || costData['Why prices vary'] || costData.whyItVaries || costData.why_prices_vary || costData['Why_prices_vary'] || costData.whyVary || costData['Why_Varies'] || costData.Why_Varies
    };
  };

  const regulationData = findProperty("regulation");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "treatment-options", label: "Treatment Options" },
    { id: "candidate", label: "Candidate & Preparation" },
    { id: "appointments", label: "Appointments & Safety" },
    { id: "cost", label: "Cost & Access" },
    { id: "results", label: "Results & Maintenance" },
    { id: "regulation", label: "Regulation & Guidelines" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <article className="max-w-7xl mx-auto p-6">
      {/* Header Section - Responsive Design */}

      {/* Mobile Layout */}
      <header className="lg:hidden bg-white rounded-2xl border border-gray-200 p-2 mb-8">
        <div className="flex gap-6">
          {/* Treatment Image */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden">
              <FallbackImage
                src={treatment.image}
                alt={`${treatment.name} treatment procedure - before and after results`}
                className="w-full h-full object-cover"
                fallback={DEFAULT_PERSON}
              />
            </div>
          </div>

          {/* Treatment Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {treatment.name}
            </h1>

            {/* Stats List - Mobile Vertical Layout */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="text-sm">{treatment.averageCost}</span>
                <span className="text-sm">Average Cost</span>
              </div>

              <div className="flex items-center gap-3">
                <ThumbsUp className="h-5 w-5 text-gray-600" />
                <span className="text-sm">{treatment.satisfaction}%</span>
                <span className="text-sm">Satisfaction</span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm">{treatment.practitioners}</span>
                <span className="text-sm">Practitioners</span>
              </div>

              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-gray-600" />
                <span className="text-sm">{treatment.reviews}</span>
                <span className="text-sm">Google Reviews</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-sm">{treatment.downtime}</span>
                <span className="text-sm">Downtime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Consultation Button */}
        <div className="mt-6">
          <Button
            className="w-full bg-black text-white hover:bg-gray-800 rounded-xl py-3 text-lg font-medium"
            data-track-cta="true"
          >
            Book Consultation
          </Button>
        </div>
      </header>

      {/* Desktop Layout - Original Design */}
      <div className="hidden lg:flex flex-col lg:flex-row gap-8 mb-8 p-5 rounded-2xl bg-[#F2EDE6]">
        {/* Treatment Image */}
        <div className="shrink-0">
          <div className="w-48 h-48 rounded-full overflow-hidden">
            <FallbackImage
              src={treatment.image}
              alt={treatment.name}
              className="w-full h-full object-cover"
              fallback={DEFAULT_PERSON}
            />
          </div>
        </div>

        {/* Treatment Info */}
        <div className="grow">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">
              {treatment.name} Treatment
            </h1>
          </header>

          {/* Treatment Statistics */}
          <section 
            className="mt-6" 
            itemScope 
            itemType="https://schema.org/MedicalProcedure"
            aria-labelledby="treatment-stats-heading"
          >
            <h2 id="treatment-stats-heading" className="sr-only">
              {treatment.name} Treatment Statistics and Key Information
            </h2>
            
            <dl className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 border-0 md:border-0 bg-transparent">
                <dt className="sr-only">Patient Satisfaction Rate</dt>
                <div 
                  itemProp="satisfactionRating" 
                  itemScope 
                  itemType="https://schema.org/Rating"
                  role="img" 
                  aria-label={`${treatment.satisfaction} percent patient satisfaction rate`}
                >
                  <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-black" aria-hidden="true" />
                  <dd className="text-2xl font-bold" itemProp="ratingValue">
                    {treatment.satisfaction}%
                  </dd>
                  <div className="text-sm text-gray-600">
                    Patient Satisfaction
                  </div>
                  <meta itemProp="bestRating" content="100" />
                  <meta itemProp="worstRating" content="0" />
                </div>
              </div>

              <div className="text-center p-4 border-0 md:border-0 bg-transparent">
                <dt className="sr-only">Average Treatment Cost</dt>
                <div 
                  itemProp="cost" 
                  itemScope 
                  itemType="https://schema.org/MonetaryAmount"
                  role="img" 
                  aria-label={`Average cost ${treatment.averageCost}`}
                >
                  <Database className="h-6 w-6 mx-auto mb-2 text-black" aria-hidden="true" />
                  <dd className="text-lg font-bold truncate max-w-[140px] mx-auto" itemProp="value" title={treatment.averageCost}>
                    {treatment.averageCost.length > 20 ? 'See provider pricing' : treatment.averageCost}
                  </dd>
                  <div className="text-sm text-gray-600">Average Cost</div>
                  <meta itemProp="currency" content="GBP" />
                </div>
              </div>

              <div className="text-center p-4 border-0 md:border-0 bg-transparent">
                <dt className="sr-only">Number of Reviews</dt>
                <div 
                  itemProp="aggregateRating" 
                  itemScope 
                  itemType="https://schema.org/AggregateRating"
                  role="img" 
                  aria-label={`${treatment.reviews} reviews`}
                >
                  <Camera className="h-6 w-6 mx-auto mb-2 text-black" aria-hidden="true" />
                  <dd className="text-2xl font-bold" itemProp="reviewCount">
                    {treatment.reviews}
                  </dd>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>

              <div className="text-center p-4 border-0 md:border-0 bg-transparent">
                <dt className="sr-only">Treatment Downtime Duration</dt>
                <div 
                  itemProp="procedureType"
                  role="img" 
                  aria-label={`${treatment.downtime} downtime required`}
                >
                  <Clock className="h-6 w-6 mx-auto mb-2 text-black" aria-hidden="true" />
                  <dd className="text-lg font-bold">
                    {treatment.downtime}
                  </dd>
                  <div className="text-sm text-gray-600">Downtime</div>
                </div>
              </div>

              <div className="text-center p-4 border-0 md:border-0 bg-transparent">
                <dt className="sr-only">Number of Available Practitioners</dt>
                <div 
                  itemProp="provider" 
                  itemScope 
                  itemType="https://schema.org/Organization"
                  role="img" 
                  aria-label={`${treatment.practitioners} practitioners available`}
                >
                  <Users className="h-6 w-6 mx-auto mb-2 text-black" aria-hidden="true" />
                  <dd className="text-2xl font-bold" itemProp="numberOfEmployees">
                    {treatment.practitioners}
                  </dd>
                  <div className="text-sm text-gray-600">Practitioners</div>
                </div>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-[#BDBDBD] pb-5 mb-8">
        <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide lg:justify-between">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              onClick={() => scrollToSection(section.id)}
              className="px-4 py-2 flex-shrink-0 lg:flex-1 text-sm hover:cursor-pointer whitespace-nowrap text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {section.label}
            </Button>
          ))}
        </div>
      </div>

      {/* All Sections */}
      <div className="flex flex-col gap-3 text-base">
        {/* Overview Section */}
        <section id="overview" className="scroll-mt-8">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Overview
            </h2>
            <div>
              <p className="text-gray-700 leading-relaxed">
                {findProperty("whatIs") ||
                  `${treatment.name} is a treatment that helps address various skin and aesthetic concerns.`}
              </p>
            </div>

            {findProperty("goals") && (
              <div>
                <h3 className="font-semibold mb-3">
                  Goals of {treatment.name} treatment
                </h3>
                <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                  {(Array.isArray(findProperty("goals"))
                    ? findProperty("goals")
                    : []
                  ).map((goal: string, index: number) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}

            {findProperty("mildVsSevere") && (
              <div>
                <h3 className="font-semibold mb-4">Severity Levels</h3>

                <div className="space-y-4">
                  {findProperty("mildVsSevere")?.Mild && (
                    <div>
                      <h4 className="font-medium">Mild</h4>
                      <p className="text-gray-700 text-base">
                        {findProperty("mildVsSevere").Mild}
                      </p>
                    </div>
                  )}

                  {findProperty("mildVsSevere")?.Severe && (
                    <div>
                      <h4 className="font-medium">Severe</h4>
                      <p className="text-gray-700">
                        {findProperty("mildVsSevere").Severe}
                      </p>
                    </div>
                  )}

                  {findProperty("mildVsSevere")?.What_it_Does_Not_Treat && (
                    <div>
                      <h4 className="font-medium">What it Does Not Treat</h4>
                      <p className="text-gray-700 text-base">
                        {findProperty("mildVsSevere").What_it_Does_Not_Treat}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Treatment Options Section */}
        <section id="treatment-options" className="scroll-mt-8">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Treatment Options
            </h2>

            {findProperty("comparison") && (
              <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                {(Array.isArray(findProperty("comparison"))
                  ? findProperty("comparison")
                  : []
                ).map((option: string, index: number) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            )}

            {findProperty("prosAndCons") && (
              <>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Pros</h4>
                  <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                    {(findProperty("prosAndCons")?.Pros || []).map(
                      (pro: string, index: number) => (
                        <li key={index}>{pro}</li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Cons</h4>
                  <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                    {(findProperty("prosAndCons")?.Cons || []).map(
                      (con: string, index: number) => (
                        <li key={index}>{con}</li>
                      ),
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Candidate & Preparation Section */}
        <section id="candidate" className="scroll-mt-8">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Candidate & Preparation
            </h2>

            {findProperty("candidate") && (
              <div>
                <h3 className="font-semibold mb-4">Who is a Good Candidate</h3>
                <ul className="space-y-2 text-gray-700 list-disc ml-6">
                  {(Array.isArray(findProperty("candidate"))
                    ? findProperty("candidate")
                    : []
                  ).map((candidate: string, index: number) => (
                    <li key={index}>{candidate}</li>
                  ))}
                </ul>
              </div>
            )}

            {findProperty("prepare") && (
              <div>
                <h3 className="font-semibold mb-4">
                  How to Prepare for Appointment
                </h3>
                <ul className="space-y-2 text-gray-700 list-disc ml-6">
                  {(Array.isArray(findProperty("prepare"))
                    ? findProperty("prepare")
                    : []
                  ).map((prep: string, index: number) => (
                    <li key={index}>{prep}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Appointments & Safety Section */}
        <section id="appointments" className="scroll-mt-8">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Appointments & Safety
            </h2>

            {findProperty("duration") && (
              <div>
                <h3 className="font-semibold mb-3">
                  What Happens During Appointment
                </h3>
                {Array.isArray(findProperty("duration")) ? (
                  <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                    {findProperty("duration").map(
                      (step: string, index: number) => (
                        <li key={index}>{step}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-700">{findProperty("duration")}</p>
                )}
              </div>
            )}

            {findProperty("safety") && (
              <div className="space-y-4">
                {findProperty("safety")?.Pain && (
                  <div>
                    <h3 className="font-semibold mb-2">Pain Considerations</h3>
                    <p className="text-gray-700 text-base">
                      {findProperty("safety").Pain}
                    </p>
                  </div>
                )}

                {findProperty("safety")?.Safety && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Safety Considerations
                    </h3>
                    {Array.isArray(findProperty("safety").Safety) ? (
                      <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                        {findProperty("safety").Safety.map(
                          (safety: string, index: number) => (
                            <li key={index}>{safety}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-700 text-sm">
                        {findProperty("safety").Safety}
                      </p>
                    )}
                  </div>
                )}

                {findProperty("safety")?.["Pain level"] && (
                  <div>
                    <h3 className="font-semibold mb-2">Pain Level</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("safety")["Pain level"]}
                    </p>
                  </div>
                )}

                {findProperty("safety")?.["Safety considerations"] && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Safety Considerations
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                      {(
                        findProperty("safety")["Safety considerations"] || []
                      ).map((consideration: string, index: number) => (
                        <li key={index}>{consideration}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {findProperty("recovery") && (
              <div className="space-y-4">
                {findProperty("recovery")?.Recover && (
                  <div>
                    <h3 className="font-semibold mb-2">Recovery Process</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("recovery").Recover}
                    </p>
                  </div>
                )}

                {findProperty("recovery")?.Side_Effects && (
                  <div>
                    <h3 className="font-semibold mb-2">Side Effects</h3>
                    <p className="text-gray-700 text-base">
                      {findProperty("recovery").Side_Effects}
                    </p>
                  </div>
                )}

                {findProperty("recovery")?.["Recovery/downtime"] && (
                  <div>
                    <h3 className="font-semibold mb-2">Recovery/Downtime</h3>
                    <p className="text-gray-700 text-base">
                      {findProperty("recovery")["Recovery/downtime"]}
                    </p>
                  </div>
                )}

                {findProperty("recovery")?.["Possible side effects"] && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Possible Side Effects
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                      {(
                        findProperty("recovery")["Possible side effects"] || []
                      ).map((effect: string, index: number) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Cost & Access Section */}
        <section id="cost">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Cost & Access
            </h2>

            {getCostData() && (
              <div className="space-y-4">
                {getCostData()?.typicalPrices && (
                  <div>
                    <h3 className="font-semibold mb-2">Typical Prices</h3>
                    <div className="text-gray-700 text-sm">
                      {typeof getCostData()?.typicalPrices === "string" ? (
                        <p>{getCostData()?.typicalPrices}</p>
                      ) : Array.isArray(getCostData()?.typicalPrices) ? (
                        <ul className="space-y-2 text-base list-disc ml-6">
                          {getCostData()?.typicalPrices.map(
                            (price: string, index: number) => (
                              <li key={index}>{price}</li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>{JSON.stringify(getCostData()?.typicalPrices)}</p>
                      )}
                    </div>
                  </div>
                )}

                {getCostData()?.whyVary && (
                  <div>
                    <h3 className="font-semibold mb-2">Why Prices Vary</h3>
                    <div className="text-gray-700 text-sm">
                      {typeof getCostData()?.whyVary === "string" ? (
                        <p>{getCostData()?.whyVary}</p>
                      ) : Array.isArray(getCostData()?.whyVary) ? (
                        <ul className="space-y-2 text-base list-disc ml-6">
                          {getCostData()?.whyVary.map(
                            (reason: string, index: number) => (
                              <li key={index}>{reason}</li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>{JSON.stringify(getCostData()?.whyVary)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {findProperty("choosing") && (
              <div>
                <h3 className="font-semibold mb-3">
                  What to Look for When Choosing a Doctor or Clinic
                </h3>
                <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                  {(Array.isArray(findProperty("choosing"))
                    ? findProperty("choosing")
                    : []
                  ).map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {findProperty("qualifications") && (
              <div>
                <h3 className="font-semibold mb-3">
                  Qualifications Practitioner Should Have
                </h3>
                <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                  {(Array.isArray(findProperty("qualifications"))
                    ? findProperty("qualifications")
                    : []
                  ).map((qual: string, index: number) => (
                    <li key={index}>{qual}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Results & Maintenance Section */}
        <section id="results" className="scroll-mt-8">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Results & Maintenance
            </h2>

            {findProperty("resultsLast") && (
              <div>
                <h3 className="font-semibold mb-3">How Long Results Last</h3>
                {Array.isArray(findProperty("resultsLast")) ? (
                  <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                    {findProperty("resultsLast").map(
                      (result: string, index: number) => (
                        <li key={index}>{result}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-700">{findProperty("resultsLast")}</p>
                )}
              </div>
            )}

            {findProperty("maintenance") && (
              <div>
                <h3 className="font-semibold mb-3">Maintenance Requirements</h3>
                {Array.isArray(findProperty("maintenance")) ? (
                  <ul className="space-y-2 text-gray-700 text-base list-disc ml-6">
                    {findProperty("maintenance").map(
                      (item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-700">{findProperty("maintenance")}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Regulation & Guidelines Section */}
        <section id="regulation" className="scroll-mt-8">
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-semibold border-b border-[#BDBDBD] pb-3">
              Regulation & Guidelines
            </h2>

            {findProperty("guidelines") && (
              <div className="space-y-4">
                {findProperty("guidelines")?.UK && (
                  <div>
                    <h3 className="font-semibold mb-2">UK Guidelines</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("guidelines").UK}
                    </p>
                  </div>
                )}

                {findProperty("guidelines")?.USA && (
                  <div>
                    <h3 className="font-semibold mb-2">USA Guidelines</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("guidelines").USA}
                    </p>
                  </div>
                )}

                {findProperty("guidelines")?.NICE && (
                  <div>
                    <h3 className="font-semibold mb-2">NICE Guidelines</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("guidelines").NICE}
                    </p>
                  </div>
                )}

                {findProperty("guidelines")?.FDA && (
                  <div>
                    <h3 className="font-semibold mb-2">FDA Guidelines</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("guidelines").FDA}
                    </p>
                  </div>
                )}

                {findProperty("guidelines")?.MHRA && (
                  <div>
                    <h3 className="font-semibold mb-2">MHRA Guidelines</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("guidelines").MHRA}
                    </p>
                  </div>
                )}

                {typeof findProperty("guidelines") === "string" && (
                  <div>
                    <h3 className="font-semibold mb-2">Guidelines</h3>
                    <p className="text-gray-700 text-sm">
                      {findProperty("guidelines")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {regulationData && (
              <div>
                <h3 className="font-semibold mb-3">
                  What to Do If Something Goes Wrong
                </h3>
                {Array.isArray(regulationData) ? (
                  <ul className="space-y-2 text-gray-700 text-sm list-disc ml-6">
                    {regulationData.map(
                      (step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ),
                    )}
                  </ul>
                ) : typeof regulationData === "object" && regulationData !== null ? (
                  <div className="space-y-4">
                    {(() => {
                      const regulationRecord = regulationData as Record<string, unknown>;
                      const regulationText = String(
                        regulationRecord.Regulation ?? regulationRecord.regulation ?? "",
                      ).trim();
                      const complaintsText = String(
                        regulationRecord.Complaints ??
                          regulationRecord.ifSomethingGoesWrong ??
                          "",
                      ).trim();

                      return (
                        <>
                          {Boolean(regulationText) && (
                            <div>
                              <h3 className="font-medium mb-1">Regulation</h3>
                              <p className="text-gray-700 text-sm">{regulationText}</p>
                            </div>
                          )}
                          {Boolean(complaintsText) && (
                            <div>
                              <h3 className="font-medium mb-1">Complaints</h3>
                              <p className="text-gray-700 text-sm">{complaintsText}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm">
                    {String(regulationData)}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}