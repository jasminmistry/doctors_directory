import consentzCustomerSlugs from "@/lib/data/consentz-customer-slugs.json";
import type { Clinic } from "@/lib/types";

const CONSENTZ_CUSTOMER_SLUGS = new Set(
  consentzCustomerSlugs.map((slug) => slug.toLowerCase())
);

export function getConsentzCustomerSlugs(): Set<string> {
  return CONSENTZ_CUSTOMER_SLUGS;
}

export function isConsentzClinicSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return CONSENTZ_CUSTOMER_SLUGS.has(slug.toLowerCase());
}

export function isDirectoryTestListing(
  ...values: Array<string | null | undefined>
): boolean {
  const haystack = values
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ")
    .toLowerCase()
    .replace(/[-_]+/g, " ");
  if (!haystack) return false;
  return (
    /\bqa test\b/.test(haystack) ||
    /\bqa clinic\b/.test(haystack) ||
    /\btest user\b/.test(haystack) ||
    /\btest clinic\b/.test(haystack)
  );
}

export function associatedClinicSlugList(
  value?: string | string[] | null,
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((slug): slug is string => typeof slug === "string");
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((slug): slug is string => typeof slug === "string");
    }
  } catch {
    return [];
  }
  return [];
}

export function isConsentzClinic(clinic: Pick<Clinic, "slug" | "isConsentz">): boolean {
  if (isDirectoryTestListing(clinic.slug)) return false;
  return Boolean(clinic.isConsentz) || isConsentzClinicSlug(clinic.slug);
}

export function isConsentzLinked(entity: {
  slug?: string | null;
  isConsentz?: boolean;
  practitioner_name?: string | null;
  Associated_Clinics?: string | string[] | null;
}): boolean {
  if (isDirectoryTestListing(entity.slug, entity.practitioner_name)) return false;
  if (Boolean(entity.isConsentz) || isConsentzClinicSlug(entity.slug)) return true;
  return associatedClinicSlugList(entity.Associated_Clinics).some((slug) =>
    isConsentzClinicSlug(slug),
  );
}

interface ListingSortable {
  id?: number | null;
  slug?: string | null;
  isConsentz?: boolean;
  reviewCount?: number | null;
  rating?: number | null;
}

/**
 * The one default listing order used by the public /search listing (clinics + practitioners),
 * the clinic city pages and the admin clinics/practitioners tables: Consentz first, then most
 * reviews, then highest rating, then id. searchClinicsForListing() and
 * searchPractitionersForListing() apply the same order in SQL — keep them in sync.
 */
export function compareClinicListingOrder(left: ListingSortable, right: ListingSortable): number {
  const leftConsentz = isConsentzClinicSlug(left.slug) || Boolean(left.isConsentz);
  const rightConsentz = isConsentzClinicSlug(right.slug) || Boolean(right.isConsentz);
  if (leftConsentz !== rightConsentz) return leftConsentz ? -1 : 1;
  // null sorts below 0, matching MySQL's DESC ordering of NULLs.
  return (
    (right.reviewCount ?? -1) - (left.reviewCount ?? -1) ||
    (right.rating ?? -1) - (left.rating ?? -1) ||
    (left.id ?? 0) - (right.id ?? 0)
  );
}
