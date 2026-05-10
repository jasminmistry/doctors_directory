export interface City {
  City: string;
  Unique_Specializations: string[];

  city_overview_population_estimate: string;
  city_overview_lifestyle_characteristics: string;
  city_overview_medical_infrastructure_presence: string;

  market_size_indicators_number_of_clinics: number;
  market_size_indicators_review_volume_total: number;
  market_size_indicators_average_rating_citywide: number;
  market_size_indicators_estimated_private_aesthetic_market_strength: string;

  competitor_landscape_nhs_presence: string;

  regulatory_environment_primary_regulator: string;
  regulatory_environment_prescribing_requirements: string;
  regulatory_environment_inspection_framework: string;

  insurance_and_financing_private_insurance_usage: string;
  insurance_and_financing_cosmetic_finance_availability: string;

  seasonality_and_local_trends_peak_booking_periods: string[];

  social_media_trends_content_trends: string[];

  referral_networks_teaching_hospital_links: string;

  accessibility_factors_public_transport_proximity: string;
  accessibility_factors_parking_availability: string;
  accessibility_factors_city_centre_vs_suburban_distribution: string;

  medical_tourism_potential_tourism_volume_indicator: string;
  medical_tourism_potential_hotel_density_near_clinics: string;
  medical_tourism_potential_airport_proximity: string;
  medical_tourism_potential_medical_tourism_viability: string;

  beauty_spend_indicators_market_maturity_level: string;
}
export interface Clinic {
  slug: string | undefined
  image: string
  url: string | undefined
  rating: number
  reviewCount: number
  category: string
  gmapsAddress: string
  //gmapsLink: string
  gmapsPhone: string
  gmapsReviews?: Review[]
  reviewAnalysis?: ReviewAnalysis
  weighted_analysis?: WeightedAnalysis
  ranking?: RankingMeta
  City: string
  facebook: string
  twitter: string	
  Linkedin: string	
  instagram: string	
  youtube: string	
  website: string	
  email: string	
  isSaveFace: boolean	
  isDoctor: boolean	
  isJCCP: [boolean, string] | null	
  isCQC: [boolean, string] | null	
  isHIW: [boolean, string] | null
  isHIS: [boolean, string] | null	
  isRQIA: [boolean, string] | null	
  about_section: string	
  accreditations: string	
  awards: string
  affiliations: string
  hours: string	
  Practitioners: string	
  Insurace: string	
  Payments: string	
  Fees: string	
  x_twitter: string
  Treatments?: string[]
  claimed?: boolean
  verified?: boolean
  domainVerified?: boolean
  gbpMatch?: boolean
  gbpVerified?: boolean
  idVerified?: boolean
  manualVerified?: boolean
}

export interface RankingMeta {
  city_rank?: number
  city_total?: number
  score_out_of_100?: number
  subtitle_text?: string
}
interface WeightedAnalysis {
  [category: string]: ItemMeta
}
export interface Practitioner extends Partial<Clinic> {
  practitioner_image_link?: string | undefined
  practitioner_roles?: string
  practitioner_qualifications?: string
  practitioner_awards?: string
  practitioner_media?: string
  practitioner_experience?: string
  practitioner_name?:string
  practitioner_title?: string	,
  practitioner_specialty?:string,	
  practitioner_education?:string,	
  Treatments?: string[]
  Title?:string
  Associated_Clinics?: string
  licensed?: boolean
}
export interface ItemMeta {
  weighted_score: number
  confidence: number
  num_mentions: number
  top_sentence: string[]
}
export interface BoxPlotDatum {
  // Short key for internal reference (matches your stats keys)
  key: string
  // Human-readable label for display (matches your provided display names)
  label: string
  stats: BoxStats
  item: ItemMeta
}
export interface BoxStats {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
}
export interface Review {
  reviewer_name: string
  rating: string
  date: string
  review_text?: string
  owner_response: string | null
  text?: string
}
export interface ReviewAnalysis {
  practitioners: Array<{
    name: string
    role_title: string
    attributes: string[]
    trust_signals: string[]
    interpersonal_skills: string[]
    experience_level?: string   // optional
  }>
  procedures_offered: {
    categories: string[]
    patient_experience: string[]
    process_mentions?: string[]       // optional
    special_mentions?: string[]       // optional
  }
  products: {
    injectables: string[]
    skin_treatments?: string[]
    product_experience: string[]
  }
  reviewer_demographics: {
    loyalty_repeat_visits: string[]
  }
  clinic_environment: string[]
  professionalism_safety: string[]
  treatment_outcomes: string[]
  referrals_recommendations: string[]
  owner_response_sentiment?: string[]
  pain_points?: string[]
  treatment_journey?: string[]
  negative_keywords?: string[]
}

export interface SearchFilters {
  type: string
  query: string
  category: string
  location: string
  rating: number
  services: string[]
  
}
export interface Product {
  // Identification
  slug:string
  key?: string;                                      // Unique ID / key
  product_name: string;
  product_category: string;
  product_subcategory: string;
  is_aesthetics_dermatology_related?: boolean | null;

  // Commercial
  all_prices: any;                                  // Parsed JSON → array/map of prices
  brand: string | null;
  manufacturer: string | null;
  distributor: string | null;
  sku: string | null;

  // Media
  image_url: string | null;
  product_document_pdf_from_manufacturer: string | null;

  // Content
  description: string
  key_benefits: string[] | null;
  indications: string[] | null;
  composition: string[] | string | null;
  formulation: string[] | null;
  packaging: string[] | null;
  usage_instructions: string[] | null;
  treatment_duration: string | null;
  onset_of_effect: string | null;

  // Safety
  contraindications: string[] | null;
  adverse_effects: string[] | null;
  storage_conditions: string[] | null;

  // Compliance
  mhra_approved: boolean | null;
  ce_marked: boolean | null;
  mhra_link: string | null;
  certifications_and_compliance: string[] | null;

  // About
  brand_about: string | null;
  seller_about: string | null;

  // Verification Metadata
  source_verified_on?: string | null;                 // ISO date string
  data_confidence_score?: number | null;              // 0–1 or 0–100 depending on your system
  verification_sources?: string[] | null;             // e.g. ["MHRA", "Manufacturer"]
  sources?: any;
  distributor_cleaned: string
  category: string                                 // optional JSON blob of raw refs
}
export interface Accreditation {
  slug: string;
  image: string;
  overview: {
    description: string;
    founded_year: string;
    founder: string;
    purpose: string;
  };
  governing_body: {
    organisation_name: string;
    company_status: string;
    regulatory_status: string;
    industry_standing: string;
  };
  eligibility_criteria: {
    who_can_apply: string;
    requirements: string[];
    restrictions: string[];
  };
  judging_criteria: {
    evaluation_factors: string[];
  };
  categories: {
    available_categories: string[];
  };
  accreditation_requirements: {
    inspection_required: string;
    documentation_required: string[];
    compliance_standards: string[];
    sources: string[];
  };
  verification_process: {
    public_register: string;
    certificate_validation_method: string;
    sources: string[];
  };
  renewal_and_compliance: {
    renewal_frequency: string;
    cpd_requirements: string;
    audit_process: string;
    sources: string[];
  };
  benefits: {
    reputation: string;
    patient_trust_impact: string;
  };
  patient_safety_impact: {
    mechanisms_of_protection: string[];
    limitations: string[];
  };
  comparison_with_other_bodies: {
    comparable_entities: string[];
    key_differences: string[];
  };
  industry_recognition: {
    media_mentions: string[];
    endorsements: string[];
    credibility_signals: string[];
  };
  government_regulation_status: {
    statutory_backing: string;
    regulated_by: string;
    legal_status: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}
