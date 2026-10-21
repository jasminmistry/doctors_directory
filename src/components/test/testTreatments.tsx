import ProfilePage from "@/app/treatments/[slug]/page";
interface ProfilePageProps {
  params: {
    slug: string;
  };
}
// Pages are async Server Components since Next 15 (awaited params), so call them
// directly and render the resolved element — RTL can't render async components.
export default async function TestTreatments({ params }: ProfilePageProps) {
  return <div>{await ProfilePage({ params: Promise.resolve(params) })}</div>;
}
