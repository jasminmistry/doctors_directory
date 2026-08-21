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
