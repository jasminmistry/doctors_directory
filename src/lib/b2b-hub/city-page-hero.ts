import {
  CITY_LOCAL_CONSENT_SLUGS,
  CITY_LOCAL_PRACTITIONER_SLUGS,
  CITY_LOCAL_SOFTWARE_SLUGS,
} from "@/lib/b2b-hub/scaled-pages-shared";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

function isSoftwareSlug(slug: string): slug is (typeof CITY_LOCAL_SOFTWARE_SLUGS)[number] {
  return (CITY_LOCAL_SOFTWARE_SLUGS as readonly string[]).includes(slug);
}

function isPractitionerSlug(
  slug: string,
): slug is (typeof CITY_LOCAL_PRACTITIONER_SLUGS)[number] {
  return (CITY_LOCAL_PRACTITIONER_SLUGS as readonly string[]).includes(slug);
}

function isConsentSlug(slug: string): slug is (typeof CITY_LOCAL_CONSENT_SLUGS)[number] {
  return (CITY_LOCAL_CONSENT_SLUGS as readonly string[]).includes(slug);
}

export function getCityScaledHero(
  cityTitle: string,
  pageSlug: string,
): { line1: string; line2: string | null; intro: string } {
  if (pageSlug === "aesthetic-clinic-software") {
    return {
      line1: "Aesthetic Clinic",
      line2: `Management Software in ${cityTitle}`,
      intro: `The clinic management platform used by ${cityTitle} aesthetic clinics — consent, CQC, patient records and automation in one place.`,
    };
  }
  if (isSoftwareSlug(pageSlug)) {
    const topic = toDisplayTitle(pageSlug.replaceAll("-", " "));
    return {
      line1: `${topic} in ${cityTitle}`,
      line2: null,
      intro: `Practical software guidance for ${cityTitle} clinics — consent, operations, and evidence without duct-taped tools.`,
    };
  }
  if (isPractitionerSlug(pageSlug)) {
    const topic = toDisplayTitle(pageSlug.replaceAll("-", " "));
    return {
      line1: `${topic} in ${cityTitle}`,
      line2: null,
      intro: `Workflow guidance for practitioners working in ${cityTitle} — safer documentation, clearer communication, and calmer compliance routines.`,
    };
  }
  if (isConsentSlug(pageSlug)) {
    const topic = toDisplayTitle(pageSlug.replaceAll("-", " "));
    return {
      line1: `${topic} in ${cityTitle}`,
      line2: null,
      intro: `Digital consent workflows for ${cityTitle} clinics — structured evidence, fewer gaps, and calmer inspections.`,
    };
  }
  const fallback = toDisplayTitle(pageSlug.replaceAll("-", " "));
  return {
    line1: `${fallback} in ${cityTitle}`,
    line2: null,
    intro: `Buyer hub guidance for ${cityTitle} — local directory links plus related software and workflow collections.`,
  };
}
