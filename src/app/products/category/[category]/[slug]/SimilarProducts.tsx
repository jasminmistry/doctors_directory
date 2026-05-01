import ItemsGrid from '@/components/collectionGrid';
import { getProductsByCategory } from '@/lib/data-access/products';

interface SimilarProductsProps {
  category: string;
  slug: string;
}

export default async function SimilarProducts({ category, slug }: SimilarProductsProps) {
  const products = await getProductsByCategory(category);
  const similarProducts = products.filter((p) => p.slug !== slug).slice(0, 6);
  return <ItemsGrid items={similarProducts} />;
}
