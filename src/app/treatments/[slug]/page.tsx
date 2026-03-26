import { notFound } from "next/navigation";
import type { Clinic } from "@/lib/types";
import type { Practitioner } from "@/lib/types";
import type { Metadata } from "next";
import { readJsonFileSync } from "@/lib/json-cache";
import treatment_content from "../../../../public/treatments.json";
import { stripContentReferencesDeep, toUrlSlug } from "@/lib/utils";
import { TreatmentDetail } from "@/components/treatment-detail";
import Script from "next/script";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ItemsGrid from "@/components/collectionGrid";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://staging.consentz.com'

type TreatmentContent = Record<string, any>;
const treatments = treatment_content as TreatmentContent;
interface ProfilePageProps {
  params: {
    slug: string;
  };
}
const TreatmentMap: Record<string, string> = {
  Acne: "/directory/treatments/acne.webp",
  Alopecia: "/directory/treatments/alopecia.webp",
  "Anti Wrinkle Treatment": "/directory/treatments/anti wrinkle treatment.webp",
  Aqualyx: "/directory/treatments/aqualyx.webp",
  Aviclear: "/directory/treatments/aviclear.webp",
  "B12 Injection": "/directory/treatments/b12.webp",
  Birthmarks: "/directory/treatments/birthmarks.webp",
  Botox: "/directory/treatments/botox.webp",
  "Breast Augmentation": "/directory/treatments/breast-augmentation.webp",
  "Cheek Enhancement": "/directory/treatments/cheek-enhancement.webp",
  "Chemical Peel": "/directory/treatments/chemical-peel.webp",
  "Chin Enhancement": "/directory/treatments/chin-enhancement.webp",
  "Aesthetic Skin Consultation": "/directory/treatments/consultation.webp",
  "Contact Dermatitis": "/directory/treatments/contact-dermatitis.webp",
  CoolSculpting: "/directory/treatments/coolsculpting.webp",
  "Cysts Treatment": "/directory/treatments/cyst-treatment.webp",
  "Dermapen Treatment": "/directory/treatments/dermapen.webp",
  "Dermatitis Treatment": "/directory/treatments/dermatitis-treatment.webp",
  "Dermatology Treatments": "/directory/treatments/dermatology-treatments.webp",
  "Eczema Treatment": "/directory/treatments/exzema-treatment.webp",
  "Eyebrows and Lashes": "/directory/treatments/eyebrow-lashes.webp",
  "Facial Treatments": "/directory/treatments/facial-treatments.webp",
  "Hair Treatments": "/directory/treatments/hair.webp",
  HIFU: "/directory/treatments/hifu.webp",
  "Hives Treatment": "/directory/treatments/hives.webp",
  Hyperhidrosis: "/directory/treatments/Hyperhidrosis.webp",
  "Inflammatory Skin Conditions":
    "/directory/treatments/inflammatory skin conditions.webp",
  "IPL Treatment": "/directory/treatments/ipl-treatments.webp",
  "Keloid Removal": "/directory/treatments/keloid removal.webp",
  "Tattoo Removal": "/directory/treatments/laser-tattoo-removal.webp",
  "Laser Treatments": "/directory/treatments/laser-treatments.webp",
  Fillers: "/directory/treatments/lip-filler-6485474_640.webp",
  Liposuction: "/directory/treatments/liposuction illustration.webp",
  Lips: "/directory/treatments/lips.webp",
  "Lymphatic Drainage": "/directory/treatments/lymphatic-drainage.webp",
  Marionettes: "/directory/treatments/marionettes.webp",
  Massage: "/directory/treatments/massage.webp",
  "Melanoma Treatment": "/directory/treatments/melanoma-treatments.webp",
  "Melasma Treatment": "/directory/treatments/melasma.webp",
  "Microneedling": "/directory/treatments/micro-needling.webp",
  Microblading: "/directory/treatments/microblading.webp",
  "Microneedling with Radiofrequency":
    "/directory/treatments/microneedling with radiofrequency.webp",
  Moles: "/directory/treatments/moles.webp",
  Nails: "/directory/treatments/nail-polish-2112358_640.webp",
  Obagi: "/directory/treatments/obagi.webp",
  "Patch Testing": "/directory/treatments/patch-testing.webp",
  "Photodynamic Therapy (PDT)":
    "/directory/treatments/photodynamic therapy.webp",
  "Pigmentation Treatment":
    "/directory/treatments/pigmentation-treatments.webp",
  "Polynucleotide Treatment":
    "/directory/treatments/polynucleotide-treatment.webp",
  Profhilo: "/directory/treatments/profhilo.webp",
  "Platelet Rich Plasma": "/directory/treatments/prp.webp",
  Psoriasis: "/directory/treatments/psoriasis.webp",
  "Rash Treatment": "/directory/treatments/rash-treatment.webp",
  "Rosacea Treatment": "/directory/treatments/rosacea.webp",
  Scarring: "/directory/treatments/scarring.webp",
  "Seborrheic Keratosis Treatment":
    "/directory/treatments/seborrheic keratosis.webp",
  "Seborrhoeic Dermatitis": "/directory/treatments/seborrhoeic dermatitis.webp",
  Rhinoplasty:
    "/directory/treatments/side-view-doctor-checking-patient-before-rhinoplasty.webp",
  "Skin Texture and Tightening":
    "/directory/treatments/skin texture and tightening.webp",
  "Skin Booster": "/directory/treatments/skin-booster.webp",
  "Skin Cancer": "/directory/treatments/skin-cancer.webp",
  "Skin Lesions": "/directory/treatments/skin-lesions.webp",
  "Skin Tags": "/directory/treatments/skin-tags.webp",
  "Tear Trough Treatment": "/directory/treatments/tear-through-treatments.webp",
  Threading: "/directory/treatments/threading.webp",
  "Varicose Vein Procedure": "/directory/treatments/varicose-vein.webp",
  "Verruca Treatment": "/directory/treatments/verruca treatment.webp",
  "Vitamin Therapy": "/directory/treatments/vitamin-therapy.webp",
  "Vulval Dermatology": "/directory/treatments/vulval-dermatology.webp",
  "Weight Loss": "/directory/treatments/weight-loss.webp",
};

const getTreatmentCategory = (treatmentName: string): string => {
  const hairTreatments = ['Alopecia', 'Hair Treatments'];
  const skinTreatments = ['Acne', 'Eczema Treatment', 'Psoriasis', 'Rosacea Treatment', 'Melasma Treatment', 'Contact Dermatitis', 'Dermatitis Treatment', 'Seborrhoeic Dermatitis'];
  const aestheticTreatments = ['Botox', 'Anti Wrinkle Treatment', 'Fillers', 'Lips', 'Cheek Enhancement', 'Chin Enhancement', 'Tear Trough Treatment', 'Marionettes'];
  const bodyTreatments = ['Liposuction', 'CoolSculpting', 'Aqualyx', 'Weight Loss', 'Breast Augmentation', 'Rhinoplasty'];
  const laserTreatments = ['Tattoo Removal', 'Laser Treatments', 'IPL Treatment', 'Photodynamic Therapy (PDT)'];
  const skincareTreatments = ['Chemical Peel', 'Microneedling', 'Dermapen Treatment', 'Profhilo', 'Skin Booster', 'Polynucleotide Treatment'];
  
  if (hairTreatments.some(t => treatmentName.toLowerCase().includes(t.toLowerCase()))) {
    return 'Hair Treatments';
  }
  if (skinTreatments.some(t => treatmentName.toLowerCase().includes(t.toLowerCase()))) {
    return 'Skin Conditions';
  }
  if (aestheticTreatments.some(t => treatmentName.toLowerCase().includes(t.toLowerCase()))) {
    return 'Aesthetic Treatments';
  }
  if (bodyTreatments.some(t => treatmentName.toLowerCase().includes(t.toLowerCase()))) {
    return 'Body Treatments';
  }
  if (laserTreatments.some(t => treatmentName.toLowerCase().includes(t.toLowerCase()))) {
    return 'Laser Treatments';
  }
  if (skincareTreatments.some(t => treatmentName.toLowerCase().includes(t.toLowerCase()))) {
    return 'Skincare Treatments';
  }
  
  return 'Dermatology';
};

const getTreatmentContentValue = (
  treatmentData: Record<string, unknown> | undefined,
  candidateKeys: readonly string[],
) => {
  if (!treatmentData) {
    return null;
  }

  for (const key of candidateKeys) {
    if (Object.prototype.hasOwnProperty.call(treatmentData, key)) {
      return treatmentData[key];
    }
  }

  return null;
};

const getAverageCost = (
  treatmentName: string,
  treatmentData: Record<string, unknown> | undefined,
) => {
  const normalizedName = treatmentName.replaceAll(/\s+/g, '_');
  const costData = getTreatmentContentValue(treatmentData, [
    `Cost_of_${normalizedName}_in_UK_and_Variations`,
    `Cost_of_${treatmentName}_in_UK_and_Variations`,
  ]);

  if (!costData) {
    return 'Cost varies by clinic';
  }

  if (typeof costData === 'string') {
    const match = costData.match(/GBP\s*[0-9,]+(?:\s*(?:to|[-–])\s*GBP\s*[0-9,]+)?/i);
    if (match) {
      return match[0].replaceAll(/GBP/gi, 'GBP ').replaceAll(/\s+/g, ' ').trim();
    }

    const poundMatch = costData.match(/£\s*[0-9,]+(?:\s*(?:to|[-–])\s*£?\s*[0-9,]+)?/i);
    if (poundMatch) {
      return poundMatch[0].replaceAll(/\s+/g, ' ').trim();
    }

    return 'See provider pricing';
  }

  if (Array.isArray(costData)) {
    return costData[0] ?? 'Cost varies by clinic';
  }

  if (typeof costData === 'object') {
    const typedCostData = costData as Record<string, unknown>;
    const typicalPrices =
      typedCostData.Typical_prices ??
      typedCostData['Typical UK costs'] ??
      typedCostData.typicalCosts ??
      typedCostData.typical_costs ??
      typedCostData.Typical_Costs ??
      typedCostData.typicalRange ??
      typedCostData.Typical_Range;

    if (typeof typicalPrices === 'string') {
      const match = typicalPrices.match(/GBP\s*[0-9,]+(?:\s*(?:to|[-–])\s*GBP\s*[0-9,]+)?/i);
      if (match) {
        return match[0].replaceAll(/GBP/gi, 'GBP ').replaceAll(/\s+/g, ' ').trim();
      }

      const poundMatch = typicalPrices.match(/£\s*[0-9,]+(?:\s*(?:to|[-–])\s*£?\s*[0-9,]+)?/i);
      if (poundMatch) {
        return poundMatch[0].replaceAll(/\s+/g, ' ').trim();
      }

      return 'See provider pricing';
    }

    if (Array.isArray(typicalPrices) && typicalPrices.length > 0) {
      return String(typicalPrices[0]);
    }
  }

  return 'See provider pricing';
};

const getDowntime = (
  treatmentName: string,
  treatmentData: Record<string, unknown> | undefined,
) => {
  const normalizedName = treatmentName.replaceAll(/\s+/g, '_');
  const recoveryData = getTreatmentContentValue(treatmentData, [
    'Recovery_Process_Downtime_Possible_Side_Effects',
    `What_is_the_recovery_process,_downtime,_and_possible_side_effects_of_${normalizedName}_treatment?`,
  ]);

  if (!recoveryData) {
    return 'Varies by treatment';
  }

  if (typeof recoveryData === 'string') {
    return recoveryData;
  }

  if (Array.isArray(recoveryData)) {
    return recoveryData[0] ?? 'Varies by treatment';
  }

  if (typeof recoveryData === 'object') {
    const typedRecoveryData = recoveryData as Record<string, unknown>;
    const recovery =
      typedRecoveryData.Recover ??
      typedRecoveryData.Recovery ??
      typedRecoveryData.recovery ??
      typedRecoveryData.answer;

    if (typeof recovery === 'string') {
      const normalizedRecovery = recovery.toLowerCase();

      if (normalizedRecovery.includes('no real downtime') || normalizedRecovery.includes('no downtime')) {
        return 'None';
      }

      if (normalizedRecovery.includes('minimal downtime') || normalizedRecovery.includes('minimal')) {
        return 'Minimal';
      }

      if (normalizedRecovery.includes('few days')) {
        return 'A few days';
      }

      if (normalizedRecovery.includes('1-2 weeks') || normalizedRecovery.includes('1 to 2 weeks')) {
        return '1-2 weeks';
      }

      if (normalizedRecovery.includes('1-2 days') || normalizedRecovery.includes('1 to 2 days')) {
        return '1-2 days';
      }

      return 'Varies';
    }
  }

  return 'Varies';
};

const getSatisfaction = (reviewCount: number) => {
  if (reviewCount >= 100) {
    return 95;
  }

  if (reviewCount >= 50) {
    return 91;
  }

  if (reviewCount >= 20) {
    return 87;
  }

  return 82;
};

const normalizeTreatmentToken = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replaceAll(/[\u2010-\u2015]/g, '-')
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim();

const getTreatmentAliases = (treatmentName: string, slug: string) => {
  const normalizedName = normalizeTreatmentToken(treatmentName);
  const normalizedSlug = normalizeTreatmentToken(slug.replaceAll('%20', ' '));
  const aliasMap: Record<string, string[]> = {
    'anti wrinkle treatment': [
      'anti wrinkle treatment',
      'anti wrinkle',
      'anti wrinkle injections',
      'anti wrinkle injection',
      'botox',
      'lines wrinkles',
    ],
    microneedling: ['microneedling', 'micro needling', 'micro-needling'],
  };

  const aliases = new Set([normalizedName, normalizedSlug]);

  for (const [key, values] of Object.entries(aliasMap)) {
    if (normalizedName === key || normalizedSlug === key) {
      values.forEach((value) => aliases.add(value));
    }
  }

  return aliases;
};

const clinicMatchesTreatment = (
  clinic: Clinic,
  treatmentAliases: Set<string>,
) => {
  const treatments = Array.isArray(clinic.Treatments) ? clinic.Treatments : [];
  const treatmentMatch = treatments.some((entry) =>
    treatmentAliases.has(normalizeTreatmentToken(String(entry))),
  );

  const feeEntries = Array.isArray(clinic.Fees) ? clinic.Fees : [];
  const feeMatch = feeEntries.some((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const treatmentLabel = 'treatment' in entry ? String(entry.treatment ?? '') : '';
    const normalizedLabel = normalizeTreatmentToken(treatmentLabel);

    return treatmentAliases.has(normalizedLabel);
  });

  const categoryEntries = clinic.reviewAnalysis?.procedures_offered?.categories ?? [];
  const categoryMatch = categoryEntries.some((entry) => {
    const normalizedEntry = normalizeTreatmentToken(String(entry));

    return treatmentAliases.has(normalizedEntry);
  });

  return treatmentMatch || feeMatch || categoryMatch;
};

const getPractitionerCount = (practitioners: Clinic['Practitioners']) => {
  if (Array.isArray(practitioners)) {
    return practitioners.length;
  }

  if (typeof practitioners === 'string') {
    const parsedCount = Number.parseInt(practitioners, 10);
    return Number.isNaN(parsedCount) ? 0 : parsedCount;
  }

  return 0;
};

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const clinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json');
  const practitionerProfiles: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');
  const { slug } = params;

  // Resolve original treatment name from either new hyphenated slug or old %20-encoded slug
  const resolvedTreatmentName =
    Object.keys(TreatmentMap).find((name) => toUrlSlug(name) === slug) ??
    (() => {
      const decoded = slug.replaceAll('%20', ' ');
      return Object.keys(TreatmentMap).find((name) => name === decoded) ?? decoded;
    })();

  // Get treatment data from treatment_content
  const treatmentSlug = resolvedTreatmentName;
  const treatmentData = stripContentReferencesDeep(treatments[treatmentSlug]);
  
  // Create treatment object for TreatmentDetail component
  const treatment = {
    name: treatmentSlug.charAt(0).toUpperCase() + treatmentSlug.slice(1),
    image: TreatmentMap[treatmentSlug], // You can map this to actual images
    satisfaction: 82,
    averageCost: "£300-£1,200+",
    reviews: 47,
    downtime: "Minimal",
    practitioners: 101,
    overview: treatmentData?.content || `${treatmentSlug} is a common treatment that helps address various skin and aesthetic concerns. Treatment options vary based on severity and individual needs.`,
    symptoms: treatmentData?.symptoms || "Symptoms and severity information for this treatment.",
    treatmentOptions: treatmentData?.options || "Various treatment options are available depending on your specific needs.",
    results: treatmentData?.results || "Results vary based on individual factors and treatment approach.",
  };

  // Get treatment category
  const treatmentCategory = getTreatmentCategory(treatment.name);

  const treatmentAliases = getTreatmentAliases(treatment.name, slug);

  const filteredClinics = clinics.filter((clinic) =>
    clinicMatchesTreatment(clinic, treatmentAliases),
  );

  const clinicSlugs = new Set(
    filteredClinics
      .map((clinic) => clinic.slug)
      .filter((clinicSlug): clinicSlug is string => Boolean(clinicSlug)),
  );

  const practitioners = new Set(
    practitionerProfiles
      .filter((practitioner) => {
        const associatedClinics = practitioner.Associated_Clinics;

        if (Array.isArray(associatedClinics)) {
          return associatedClinics.some(
            (clinicSlug) => typeof clinicSlug === 'string' && clinicSlugs.has(clinicSlug),
          );
        }

        if (typeof associatedClinics !== 'string') {
          return false;
        }

        try {
          const parsedClinics = JSON.parse(associatedClinics) as unknown;

          if (Array.isArray(parsedClinics)) {
            return parsedClinics.some(
              (clinicSlug) => typeof clinicSlug === 'string' && clinicSlugs.has(clinicSlug),
            );
          }
        } catch {
          return clinicSlugs.has(associatedClinics);
        }

        return false;
      })
      .map((practitioner) => practitioner.practitioner_name)
      .filter((practitionerName): practitionerName is string => Boolean(practitionerName)),
  ).size;

  const reviews = filteredClinics.reduce((total, clinic) => {
    const reviewCount = Number.parseInt(String(clinic.reviewCount ?? '0'), 10);

    if (Number.isNaN(reviewCount)) {
      return total;
    }

    return total + reviewCount;
  }, 0);

  const averageCost = getAverageCost(treatment.name, treatmentData);
  const downtime = getDowntime(treatment.name, treatmentData);
  const satisfaction = getSatisfaction(reviews);

  if (!filteredClinics) {
    notFound();
  }

  treatment.satisfaction = satisfaction;
  treatment.averageCost = averageCost;
  treatment.reviews = reviews;
  treatment.downtime = downtime;
  treatment.practitioners = practitioners;

  // Generate structured data for SEO
  const whatIsPropertyName = `What_is_${treatmentSlug.replaceAll(/\s+/g, '_')}_How_does_it_work`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatment.name,
    description:
      treatmentData?.[whatIsPropertyName] ||
      `${treatment.name} is a medical treatment that helps address various skin and aesthetic concerns.`,
    url: `${baseUrl}/directory/treatments/${params.slug}`,
    image: treatment.image,
    medicalSpecialty: "Dermatology",
    bodyLocation: "Skin",
    expectedPrognosis: treatment.results,
    preparation: "Consultation with qualified practitioner recommended",
    followup: treatment.downtime,
    provider: {
      "@type": "Organization",
      name: "Healthcare Directory",
      url: `${baseUrl}/directory`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      ratingCount: treatment.reviews,
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: treatment.averageCost,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <main className="bg-(--primary-bg-color)">
        {/* Treatment Detail Section */}
        <div className="bg-white">
          <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto max-w-7xl px-4 py-4">
              <Link className="mb-2 inline-block" href="/" prefetch={false}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Directory
                </Button>
              </Link>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/directory/treatments">
                      Treatments
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{treatmentCategory}</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{`${treatment.name}`}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          <TreatmentDetail
            treatment={treatment}
            treatmentData={treatmentData}
          />
          {/* Similar Clinics Section */}
          <div className="container mx-auto max-w-7xl px-4 py-4">
            <div className="px-4 md:px-0 space-y-6 mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Top Clinics for {treatment.name}
              </h3>
              <ItemsGrid items={filteredClinics.slice(0, 6)} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// export async function generateStaticParams() {
//   // Generate static params for all treatments
//   const treatmentSlugs = Object.keys(treatment_content);
//   return treatmentSlugs.map((slug) => ({
//     slug: slug.toLowerCase().replaceAll(" ", "%20"),
//   }));
// }

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = params;
  const treatmentSlug = slug.replaceAll("%20", " ");
  const treatmentData = (treatment_content as TreatmentContent)[treatmentSlug];
  
  const treatmentName = treatmentSlug.charAt(0).toUpperCase() + treatmentSlug.slice(1);
  const whatIsPropertyName = `What_is_${treatmentSlug.replaceAll(/\s+/g, '_')}_How_does_it_work`;
  const description = treatmentData?.[whatIsPropertyName] 
    ? `${treatmentData[whatIsPropertyName].substring(0, 155)}...`
    : `Find qualified practitioners for ${treatmentName} treatment. Compare providers, read reviews, and book consultations for professional ${treatmentName} services.`;
  
  const title = `${treatmentName} Treatment - Find Qualified Practitioners | Healthcare Directory`;
  const image = TreatmentMap[treatmentSlug] || '/directory/treatments/default-treatment.webp';
  const url = `${baseUrl}/directory/treatments/${slug}`;

  return {
    title,
    description,
    keywords: `${treatmentName}, ${treatmentName} treatment, dermatology, skin care, aesthetic treatment, medical procedure, qualified practitioners, healthcare directory`,
    authors: [{ name: 'Healthcare Directory' }],
    creator: 'Healthcare Directory',
    publisher: 'Healthcare Directory',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title,
      description,
      siteName: 'Healthcare Directory',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${treatmentName} treatment image`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@healthcaredirectory',
    },
    alternates: {
      canonical: url,
    },
    verification: {
      google: 'your-google-verification-code',
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
    },
  };
}