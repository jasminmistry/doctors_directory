import ProfilePage from "@/app/clinics/[cityslug]/services/[serviceslug]/page";
interface ProfilePageProps {
  params: {
    cityslug: string;
    serviceslug: string;
  };
}
// Pages are async Server Components since Next 15 (awaited params), so call them
// directly and render the resolved element — RTL can't render async components.
export default async function TestServicesCount({ params }: ProfilePageProps) {
  return <div>{await ProfilePage({ params: Promise.resolve(params) })}</div>;
}