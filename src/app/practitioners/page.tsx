import SearchPage from "@/components/search/searchClient";
import { toDirectoryCanonical } from "@/lib/seo";

export const metadata = {
  title: "Best Verified Aesthetic Practitioners UK - Reviews & Booking",
  description: "Find the best verified aesthetic practitioners across the UK. Compare qualifications, real patient reviews and book your consultation today.",
  alternates: {
    canonical: toDirectoryCanonical("/practitioners"),
  },
};

export default function HomePage() {
  return <SearchPage forcedType="Practitioner" />;
}