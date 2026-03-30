import { MoreItems } from '@/components/MoreItems';
import { locations } from '@/lib/data';

export default async function Locations() {
  return <MoreItems items={locations.slice(0, 8)} />;
}
