import { COMPETITOR_LABEL, COMPETITOR_ORDER } from "@/lib/b2b-hub/competitors";

export type MigrateNavLink = { label: string; href: string };

/** Nine migrate landing cards (excludes current `from-{slug}` page). */
export function migrateHubNavLinks(fromEntrySlug: string): MigrateNavLink[] {
  const competitorKey = fromEntrySlug.replace(/^from-/, "");
  const others = COMPETITOR_ORDER.filter((c) => c !== competitorKey).slice(0, 9);
  return others.map((c) => ({
    label: `Migrate from ${COMPETITOR_LABEL[c]}`,
    href: `/business/migrate/from-${c}/`,
  }));
}

export function migrateSlugToCompetitorKey(slug: string): string | null {
  if (!slug.startsWith("from-")) return null;
  return slug.slice("from-".length);
}
