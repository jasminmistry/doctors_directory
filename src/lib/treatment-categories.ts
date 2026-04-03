import { toUrlSlug } from "@/lib/utils";

export const treatmentCategoryLabels = [
  "Hair Treatments",
  "Skin Conditions",
  "Aesthetic Treatments",
  "Body Treatments",
  "Laser Treatments",
  "Skincare Treatments",
  "Dermatology",
] as const;

export type TreatmentCategory = (typeof treatmentCategoryLabels)[number];

const hairTreatments = ["Alopecia", "Hair Treatments"];
const skinTreatments = [
  "Acne",
  "Eczema Treatment",
  "Psoriasis",
  "Rosacea Treatment",
  "Melasma Treatment",
  "Contact Dermatitis",
  "Dermatitis Treatment",
  "Seborrhoeic Dermatitis",
];
const aestheticTreatments = [
  "Botox",
  "Anti Wrinkle Treatment",
  "Fillers",
  "Lips",
  "Cheek Enhancement",
  "Chin Enhancement",
  "Tear Trough Treatment",
  "Marionettes",
];
const bodyTreatments = [
  "Liposuction",
  "CoolSculpting",
  "Aqualyx",
  "Weight Loss",
  "Breast Augmentation",
  "Rhinoplasty",
];
const laserTreatments = [
  "Tattoo Removal",
  "Laser Treatments",
  "IPL Treatment",
  "Photodynamic Therapy (PDT)",
];
const skincareTreatments = [
  "Chemical Peel",
  "Microneedling",
  "Dermapen Treatment",
  "Profhilo",
  "Skin Booster",
  "Polynucleotide Treatment",
];

export const getTreatmentCategory = (treatmentName: string): TreatmentCategory => {
  const normalized = treatmentName.toLowerCase();

  if (hairTreatments.some((item) => normalized.includes(item.toLowerCase()))) {
    return "Hair Treatments";
  }

  if (skinTreatments.some((item) => normalized.includes(item.toLowerCase()))) {
    return "Skin Conditions";
  }

  if (aestheticTreatments.some((item) => normalized.includes(item.toLowerCase()))) {
    return "Aesthetic Treatments";
  }

  if (bodyTreatments.some((item) => normalized.includes(item.toLowerCase()))) {
    return "Body Treatments";
  }

  if (laserTreatments.some((item) => normalized.includes(item.toLowerCase()))) {
    return "Laser Treatments";
  }

  if (skincareTreatments.some((item) => normalized.includes(item.toLowerCase()))) {
    return "Skincare Treatments";
  }

  return "Dermatology";
};

const categoryBySlug = new Map<string, TreatmentCategory>(
  treatmentCategoryLabels.map((label) => [toUrlSlug(label), label]),
);

export const getTreatmentCategoryFromSlug = (slug: string): TreatmentCategory | null => {
  return categoryBySlug.get(slug) ?? null;
};

export const getTreatmentCategorySlug = (category: TreatmentCategory): string => {
  return toUrlSlug(category);
};