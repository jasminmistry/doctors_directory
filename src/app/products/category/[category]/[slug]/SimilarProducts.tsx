import ItemsGrid from '@/components/collectionGrid';
import { Product } from '@/lib/types';
import { readJsonFileSync } from '@/lib/json-cache';

interface SimilarProductsProps {
  category: string;
  slug: string;
}

export default async function SimilarProducts({ category, slug }: SimilarProductsProps) {
  const clinics: Product[] = readJsonFileSync('products_processed_new.json');
  const similarProducts = clinics.filter((p) => p.category === category && p.slug !== slug).slice(0, 6);
  return <ItemsGrid items={similarProducts} />;
}
