import { MoreItems } from '@/components/MoreItems';
import { getAllTreatmentNames } from '@/lib/data-access/treatments';

export default async function UniqueTreatments() {
  const treatments = await getAllTreatmentNames();
  return <MoreItems items={treatments} />;
}
