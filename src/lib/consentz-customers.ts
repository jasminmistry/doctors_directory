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

export function isConsentzClinic(clinic: Pick<Clinic, "slug" | "isConsentz">): boolean {
  if (isDirectoryTestListing(clinic.slug)) return false;
  return Boolean(clinic.isConsentz) || isConsentzClinicSlug(clinic.slug);
}
