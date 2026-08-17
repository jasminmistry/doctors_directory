import consentzCustomerSlugs from "@/lib/data/consentz-customer-slugs.json";
import type { Clinic } from "@/lib/types";

const CONSENTZ_CUSTOMER_SLUGS = new Set(
  consentzCustomerSlugs.map((slug) => slug.toLowerCase())
);

export function isConsentzClinicSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return CONSENTZ_CUSTOMER_SLUGS.has(slug.toLowerCase());
}

export function isConsentzClinic(clinic: Pick<Clinic, "slug" | "isConsentz">): boolean {
  return Boolean(clinic.isConsentz) || isConsentzClinicSlug(clinic.slug);
}
