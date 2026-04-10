import SearchPage from "@/components/search/searchClient";
import { toDirectoryCanonical } from "@/lib/seo";

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/products"),
  },
};

export default function ProductsPage() {
  return <SearchPage forcedType="Product" />;
}
