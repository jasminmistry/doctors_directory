import { getClinics, getPractitioners } from "@/lib/sitemap-data";

export type CityMarketStats = {
  clinicCount: number;
  practitionerCount: number;
  topTreatment: string;
  secondTreatment: string;
};

function normCity(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Directory-backed counts for the city “market” stat strip. */
export function getCityMarketStats(cityDisplayName: string): CityMarketStats {
  const key = normCity(cityDisplayName);
  const clinics = getClinics().filter((c) => normCity(c.City || "") === key);
  const practitioners = getPractitioners().filter(
    (p) => normCity((p.City as string | undefined) || "") === key,
  );
  const treatmentCounts = new Map<string, number>();
  for (const c of clinics) {
    for (const raw of c.Treatments || []) {
      const t = raw.trim();
      if (!t) continue;
      treatmentCounts.set(t, (treatmentCounts.get(t) || 0) + 1);
    }
  }
  const sorted = [...treatmentCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const topTreatment = sorted[0]?.[0] ?? "Botox";
  const secondTreatment = sorted[1]?.[0] ?? "Dermal filler";
  return {
    clinicCount: clinics.length,
    practitionerCount: practitioners.length,
    topTreatment,
    secondTreatment,
  };
}
