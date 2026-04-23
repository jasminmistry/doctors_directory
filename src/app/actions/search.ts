'use server'
import { cache } from "react";
import { Clinic, Practitioner, Product, SearchFilters } from "@/lib/types"
import { readJsonFileSync } from "@/lib/json-cache"
import { modalities } from "@/lib/data";
import { getAllClinicsForSearch, type SearchClinic } from "@/lib/data-access/clinics"

type SearchClinicResult = Pick<
  Clinic,
  | "slug"
  | "image"
  | "rating"
  | "reviewCount"
  | "category"
  | "gmapsAddress"
  | "City"
  | "isSaveFace"
  | "isDoctor"
  | "isJCCP"
  | "isCQC"
  | "isHIW"
  | "isHIS"
  | "isRQIA"
  | "Treatments"
>;

type SearchPractitioner = SearchClinicResult &
  Pick<
    Practitioner,
    | "practitioner_name"
    | "practitioner_title"
    | "practitioner_qualifications"
    | "practitioner_awards"
  >;

// Helper to convert database clinic to old format for compatibility
function convertDbClinicToOldFormat(clinic: SearchClinic): SearchClinicResult {
  return {
    slug: clinic.slug || undefined,
    image: clinic.image || '',
    rating: clinic.rating ? Number(clinic.rating) : 0,
    reviewCount: clinic.reviewCount || 0,
    category: clinic.category || '',
    gmapsAddress: clinic.gmapsAddress || '',
    City: clinic.City || '',
    isSaveFace: clinic.isSaveFace,
    isDoctor: clinic.isDoctor,
    isJCCP: clinic.isJccp ? [clinic.isJccp, null] : null,
    isCQC: clinic.isCqc ? [clinic.isCqc, null] : null,
    isHIW: clinic.isHiw ? [clinic.isHiw, null] : null,
    isHIS: clinic.isHis ? [clinic.isHis, null] : null,
    isRQIA: clinic.isRqia ? [clinic.isRqia, null] : null,
    Treatments: clinic.Treatments || [],
  }
}

export const loadData = cache(async () => {
  const clinicsDataFromDb = await getAllClinicsForSearch()
  const practitionersData: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json')
  const productsData: Product[] = readJsonFileSync('products_processed_new.json')
  const treatments = modalities;

  const clinics = clinicsDataFromDb.map(convertDbClinicToOldFormat);

  const clinicIndex = new Map(
    clinics.map(c => [c.slug, c])
  )


  const practitioners = practitionersData.reduce<SearchPractitioner[]>((accumulator, practitioner) => {
    const clinic = clinicIndex.get(JSON.parse(practitioner.Associated_Clinics!)[0])

    if (!clinic) {
      return accumulator
    }

    accumulator.push({
      ...clinic,
      practitioner_name: practitioner.practitioner_name,
      practitioner_title: practitioner.practitioner_title,
      practitioner_qualifications: practitioner.practitioner_qualifications,
      practitioner_awards: practitioner.practitioner_awards,
    })

    return accumulator
  }, [])


  const products = productsData.map(
    (
      clinic,
    ): Pick<Product, "category" | "product_name" | "brand" | "manufacturer" | "distributor_cleaned" | "image_url" | "slug"> => ({
      product_name: clinic.product_name,
      brand: clinic.brand,
      manufacturer: clinic.manufacturer,
      distributor_cleaned: clinic.distributor_cleaned,
      category: clinic.category,
      image_url: clinic.image_url,
      slug: clinic.slug,
    }),
  );

  return { clinics, practitioners, products, treatments };
});






const ITEMS_PER_PAGE = 9

export async function searchPractitioners(
  filters: SearchFilters,
  page: number = 1,
  sortBy: string = "default"
) {
  const { clinics, practitioners, products, treatments } = await loadData();

  const start = performance.now();
  
  let filtered: any[] = []
  
  if (filters.type === "Clinic") {
    filtered = ( clinics).filter((clinic) => {

      if (filters.query) {
        const queryWords = filters.query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
        const searchableText = [
          clinic.slug,
          clinic.category,
          clinic.gmapsAddress,
          ...(clinic.Treatments || []),
        ].join(" ").toLowerCase()
        const hasAllWords = queryWords.every(word => searchableText.includes(word))
        if (!hasAllWords) return false
      }

      if (filters.category && filters.category !== "All Categories") {
        if (clinic.category !== filters.category) return false
      }

      if (filters.location) {
        const location = filters.location.toLowerCase()
        if (!clinic.gmapsAddress.toLowerCase().includes(location)) return false
      }

      if (filters.services.length > 0) {
        const practitionerServices = clinic.Treatments || []
        const hasMatchingService = filters.services.some((service) =>
          practitionerServices.some((ps) => ps.includes(service.toLowerCase())),
        )
        if (!hasMatchingService) return false
      }

      if (filters.rating > 0) {
        if (clinic.rating < filters.rating) return false
      }

      return true
    })
  } else if (filters.type === "Product") {
    filtered = ( products).filter((product) => {
      if (filters.query) {
        const queryWords = filters.query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
        const searchableText = [
          product.product_name,
          product.category,
          product.brand,
          product.manufacturer,
        ].join(" ").toLowerCase()
        const hasAllWords = queryWords.every(word => searchableText.includes(word))
        if (!hasAllWords) return false
      }

      if (filters.category && filters.category !== "All Categories") {
        if (product.brand !== filters.category) return false
      }

      if (filters.location) {
        if (product.distributor_cleaned !== filters.location) return false
      }

      if (filters.services.length > 0) {
        const hasMatchingService = filters.services.some((service) =>
          product.category.toLowerCase().includes(service.toLowerCase())
        )
        if (!hasMatchingService) return false
      }

      return true
    })
  } else if (filters.type === "Treatments") {
    filtered = ( treatments).filter((treatment: string) => {
      if (filters.query) {
        const queryWords = filters.query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
        const treatmentText = treatment.toLowerCase()
        const hasAllWords = queryWords.every(word => treatmentText.includes(word))
        if (!hasAllWords) return false
      }

      if (filters.category && filters.category !== "All Categories") {
        const treatmentCategories = {
          "acne": ["Acne", "Rosacea Treatment", "Eczema Treatment", "Psoriasis", "Dermatitis Treatment"],
          "anti-aging": ["Anti Wrinkle Treatment", "Botox", "Fillers", "Chemical Peel", "Microneedling", "Profhilo"],
          "pigmentation": ["Pigmentation Treatment", "Melasma Treatment", "IPL Treatment"],
          "hair-loss": ["Alopecia", "Hair Treatments"],
          "body-contouring": ["CoolSculpting", "Liposuction", "Aqualyx", "Lymphatic Drainage"]
        }
        
        const categoryTreatments = treatmentCategories[filters.category as keyof typeof treatmentCategories] || []
        if (!categoryTreatments.includes(treatment)) return false
      }

      if (filters.services.length > 0) {
        const treatmentTypeMapping = {
          "surgical": ["Surgery", "Liposuction", "Breast Augmentation", "Rhinoplasty"],
          "non-surgical": ["Botox", "Fillers", "Chemical Peel", "Microneedling", "HIFU", "CoolSculpting", "Profhilo"],
          "laser": ["Laser Treatments", "IPL Treatment", "Tattoo Removal", "Aviclear"],
          "injectable": ["Botox", "Fillers", "Aqualyx", "B12 Injection", "Profhilo", "Platelet Rich Plasma"],
          "skincare": ["Chemical Peel", "Microneedling", "Facial Treatments", "Obagi"],
        }

        const treatmentType = filters.services[0]
        const mappedTreatments = treatmentTypeMapping[treatmentType as keyof typeof treatmentTypeMapping] || []
        const hasMatchingType = mappedTreatments.some((mappedTreatment) =>
          treatment.toLowerCase().includes(mappedTreatment.toLowerCase()) ||
          mappedTreatment.toLowerCase().includes(treatment.toLowerCase())
        ) || treatment.toLowerCase().includes(treatmentType.toLowerCase())

        if (!hasMatchingType) return false
      }

      if (filters.location) {
        const treatmentAreaMapping = {
          "face": ["Anti Wrinkle Treatment", "Botox", "Fillers", "Chemical Peel", "Cheek Enhancement", "Chin Enhancement", "Lips", "Marionettes", "Tear Trough Treatment"],
          "body": ["CoolSculpting", "Liposuction", "Breast Augmentation", "Aqualyx", "Lymphatic Drainage"],
          "hair": ["Alopecia", "Hair Treatments"],
          "skin": ["Acne", "Pigmentation Treatment", "Melasma Treatment", "Rosacea Treatment", "Eczema Treatment"],
          "lips": ["Lips", "Fillers"],
        }

        const area = filters.location.toLowerCase()
        const mappedTreatments = treatmentAreaMapping[area as keyof typeof treatmentAreaMapping] || []
        const hasMatchingArea = mappedTreatments.some((mappedTreatment) =>
          treatment.toLowerCase().includes(mappedTreatment.toLowerCase()) ||
          mappedTreatment.toLowerCase().includes(treatment.toLowerCase())
        ) || treatment.toLowerCase().includes(area)

        if (!hasMatchingArea) return false
      }

      return true
    })
  } else if (filters.type === 'Practitioner') {
    filtered = ( practitioners).filter((practitioner) => {
      if (filters.query) {
        
        const queryWords = filters.query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
        const searchableText = [
          practitioner?.practitioner_name,
          practitioner?.practitioner_qualifications?.toLowerCase(),
          practitioner?.category,
          practitioner?.gmapsAddress,
          practitioner?.practitioner_awards?.toLowerCase(),
          ...(practitioner?.Treatments || []),
        ].join(" ").toLowerCase()
        const hasAllWords = queryWords.every(word => searchableText.includes(word))
        if (!hasAllWords) return false
      }

      if (filters.category && filters.category !== "All Categories") {
        if (!practitioner?.practitioner_qualifications?.toLowerCase().includes(filters.category.toLowerCase())) return false  
      }

      if (filters.location) {
        const location = filters.location.toLowerCase()
        if (!practitioner?.gmapsAddress.toLowerCase().includes(location)) return false
      }

      if (filters.services.length > 0) {
        const service = filters.services[0]
        if(!practitioner?.practitioner_title?.toLowerCase().includes(service.toLowerCase())) return false
        
      }

      if (filters.rating > 0) {
        if (practitioner!.rating < filters.rating) return false
      }

      return true
    })
  }

  filtered.sort((a: any, b: any) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "reviews":
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })
  const end = performance.now();
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return {
    data: paginatedData,
    totalCount,
    totalPages,
    currentPage: page
  }
}

export async function getSearchDiscoveryData(filters: SearchFilters) {
  const { clinics, practitioners, products } = await loadData();

  const normalizedQuery = filters.query.trim().toLowerCase();
  const normalizedLocation = filters.location.trim().toLowerCase();
  const normalizedServices = filters.services.map((service) => service.toLowerCase());

  const clinicScore = (clinic: typeof clinics[number]) => {
    let score = 0;
    const searchable = [
      clinic.slug,
      clinic.category,
      clinic.gmapsAddress,
      ...(clinic.Treatments || []),
    ].join(" ").toLowerCase();

    if (!normalizedQuery || searchable.includes(normalizedQuery)) {
      score += normalizedQuery ? 3 : 1;
    }

    if (!normalizedLocation || clinic.gmapsAddress.toLowerCase().includes(normalizedLocation)) {
      score += normalizedLocation ? 2 : 1;
    }

    if (
      normalizedServices.length === 0 ||
      normalizedServices.some((service) =>
        (clinic.Treatments || []).some((treatment) => treatment.includes(service))
      )
    ) {
      score += normalizedServices.length > 0 ? 2 : 1;
    }

    return score;
  };

  const practitionerScore = (practitioner: typeof practitioners[number]) => {
    let score = 0;
    const searchable = [
      practitioner.practitioner_name,
      practitioner.practitioner_title,
      practitioner.practitioner_qualifications,
      practitioner.practitioner_awards,
      practitioner.gmapsAddress,
      ...(practitioner.Treatments || []),
    ].join(" ").toLowerCase();

    if (!normalizedQuery || searchable.includes(normalizedQuery)) {
      score += normalizedQuery ? 3 : 1;
    }

    if (!normalizedLocation || String(practitioner.gmapsAddress).toLowerCase().includes(normalizedLocation)) {
      score += normalizedLocation ? 2 : 1;
    }

    if (
      normalizedServices.length === 0 ||
      normalizedServices.some((service) => searchable.includes(service))
    ) {
      score += normalizedServices.length > 0 ? 2 : 1;
    }

    return score;
  };

  const suggestedClinics = [...clinics]
    .map((clinic) => ({ clinic, score: clinicScore(clinic) }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.clinic.reviewCount - left.clinic.reviewCount ||
        right.clinic.rating - left.clinic.rating
    )
    .slice(0, 6)
    .map(({ clinic }) => clinic);

  const suggestedPractitioners = [...practitioners]
    .map((practitioner) => ({ practitioner, score: practitionerScore(practitioner) }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.practitioner.reviewCount - left.practitioner.reviewCount ||
        right.practitioner.rating - left.practitioner.rating
    )
    .slice(0, 6)
    .map(({ practitioner }) => practitioner);

  const suggestedProducts = [...products]
    .map((product) => {
      const searchable = [
        product.product_name,
        product.brand,
        product.manufacturer,
        product.category,
      ].join(" ").toLowerCase();

      let score = 0;
      if (!normalizedQuery || searchable.includes(normalizedQuery)) {
        score += normalizedQuery ? 3 : 1;
      }

      if (
        normalizedServices.length === 0 ||
        normalizedServices.some((service) => searchable.includes(service))
      ) {
        score += normalizedServices.length > 0 ? 2 : 1;
      }

      if (!filters.category || filters.category === "All Categories" || searchable.includes(filters.category.toLowerCase())) {
        score += filters.category && filters.category !== "All Categories" ? 2 : 1;
      }

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.product.product_name.localeCompare(right.product.product_name)
    )
    .slice(0, 6)
    .map(({ product }) => product);

  const treatmentCounts = new Map<string, number>();
  for (const clinic of clinics) {
    for (const treatment of clinic.Treatments || []) {
      treatmentCounts.set(treatment, (treatmentCounts.get(treatment) ?? 0) + 1);
    }
  }

  const popularTreatments = [...treatmentCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 15)
    .map(([treatment]) => treatment);

  return {
    suggestedClinics,
    suggestedPractitioners,
    suggestedProducts,
    popularTreatments,
  };
}