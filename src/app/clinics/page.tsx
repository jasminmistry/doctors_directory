import SearchPage from "@/components/search/searchClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";

export const metadata = {
  alternates: {
    canonical: `${baseUrl}/directory/clinics`,
  },
};

export default function HomePage() {
  return <SearchPage forcedType="Clinic" />;
}