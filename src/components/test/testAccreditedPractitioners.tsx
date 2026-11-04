import AccreditedPractitionersPage from "@/app/accredited/[accreditation]/practitioners/[cityslug]/page";
interface AccreditedPractitionersPageProps {
  params: {
    accreditation: string;
    cityslug: string;
  };
}
// Pages are async Server Components since Next 15 (awaited params), so call them
// directly and render the resolved element — RTL can't render async components.
export default async function TestAccreditedPractitioners({ params }: AccreditedPractitionersPageProps) {
  return <div>{await AccreditedPractitionersPage({ params: Promise.resolve(params) })}</div>;
}
