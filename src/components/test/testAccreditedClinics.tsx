import AccreditedClinicsPage from "@/app/accredited/[accreditation]/clinics/[cityslug]/page";
interface AccreditedClinicsPageProps {
  params: {
    accreditation: string;
    cityslug: string;
  };
}
// Pages are async Server Components since Next 15 (awaited params), so call them
// directly and render the resolved element — RTL can't render async components.
export default async function TestAccreditedClinics({ params }: AccreditedClinicsPageProps) {
  return <div>{await AccreditedClinicsPage({ params: Promise.resolve(params) })}</div>;
}
