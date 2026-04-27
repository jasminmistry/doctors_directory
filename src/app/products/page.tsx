import SearchPage from "@/components/search/searchClient";
import { toDirectoryCanonical } from "@/lib/seo";

export const metadata = {
  title: "Aesthetic Products & Devices | Compare Brands & Prices",
  description: "Browse verified aesthetic products and medical devices. Compare brands, formulations and prices from leading manufacturers.",
  alternates: {
    canonical: toDirectoryCanonical("/products"),
  },
};

export default function ProductsPage() {
  return <SearchPage forcedType="Product" />;
}
