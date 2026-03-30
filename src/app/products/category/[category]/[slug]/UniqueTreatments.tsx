import { MoreItems } from '@/components/MoreItems';
import { Clinic } from '@/lib/types';
import { readJsonFileSync } from '@/lib/json-cache';

export default async function UniqueTreatments() {
  // Simulate async loading
  await new Promise((resolve) => setTimeout(resolve, 0));
  const allClinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json');
  const uniqueTreatments = [
    ...new Set(
      allClinics
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];
  return <MoreItems items={uniqueTreatments} />;
}
