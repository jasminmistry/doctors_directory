import ProfilePage from "@/app/practitioners/[cityslug]/page";
interface ProfilePageProps {
  params: {
    cityslug: string;
    slug: string;
  };
}
// Pages are async Server Components since Next 15 (awaited params), so call them
// directly and render the resolved element — RTL can't render async components.
export default async function TestPractitionersByCity({ params }: ProfilePageProps) {
  return <div>{await ProfilePage({ params: Promise.resolve(params) })}</div>;
}
