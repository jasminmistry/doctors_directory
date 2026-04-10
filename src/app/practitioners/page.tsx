import SearchPage from "@/components/search/searchClient";
import { toDirectoryCanonical } from "@/lib/seo";

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/practitioners"),
  },
};

export default function HomePage() {
  return <SearchPage forcedType="Practitioner" />;
}