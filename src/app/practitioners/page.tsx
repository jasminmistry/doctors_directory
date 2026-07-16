import SearchPage from "@/components/search/searchClient";
import { getPractitionerDirectoryRobots } from "@/lib/practitioner-profile-robots";
import { toDirectoryCanonical } from "@/lib/seo";

const robots = getPractitionerDirectoryRobots();

export const metadata = {
  title: "Best Verified Aesthetic Practitioners UK - Reviews & Booking",
  description: "Find the best verified aesthetic practitioners across the UK. Compare qualifications, real patient reviews and book your consultation today.",
  alternates: {
    canonical: toDirectoryCanonical("/practitioners"),
  },
  ...(robots ? { robots } : {}),
};

export default function HomePage() {
  return <SearchPage forcedType="Practitioner" />;
}