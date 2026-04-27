import SearchPage from "@/components/search/searchClient";
import { toDirectoryCanonical } from "@/lib/seo";

export const metadata = {
  title: "Aesthetic Treatments Guide - Prices, Reviews & Book",
  description: "Explore all aesthetic treatments available in the UK. Compare costs, find top rated practitioners and book your treatment today.",
  alternates: {
    canonical: toDirectoryCanonical("/treatments"),
  },
};

export default function HomePage() {
  return <SearchPage forcedType="Treatments" />;
}