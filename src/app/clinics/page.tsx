import SearchPage from "@/components/search/searchClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";

export const metadata = {
  title: "Top Rated Aesthetic Clinics UK - Reviews, Prices & Booking",
  description: "Find the best verified aesthetic clinics across the UK. Compare real patient reviews, treatment prices and book with confidence.",
  alternates: {
    canonical: `${baseUrl}/directory/clinics`,
  },
};

export default function HomePage() {
  return <SearchPage forcedType="Clinic" />;
}