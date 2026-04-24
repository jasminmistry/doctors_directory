import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/Product/profile-header";
import ClinicDetailsMarkdown from "@/components/Product/ProductDetailsMD";
import { Product } from "@/lib/types";
import { getProductBySlug, getProductsByBrand } from "@/lib/data-access/products";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import PractitionerTabs from "@/components/Product/ProductTabs";
import ItemsGrid from "@/components/collectionGrid";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
import { getAllClinicsForSearch } from "@/lib/data-access/clinics";
import { getAllTreatmentNames } from "@/lib/data-access/treatments";
import { toDirectoryCanonical } from "@/lib/seo";


interface ProfilePageProps {
  params: {
    brand: string;
    slug: string;
  };
}

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const { slug } = params;

  const clinic = await getProductBySlug(slug);
  if (!clinic) {
    notFound();
  }

  const [brandProducts, uniqueTreatments] = await Promise.all([
    getProductsByBrand(clinic.brand || ''),
    getAllTreatmentNames(),
  ]);
  const similarProducts = brandProducts.filter((p) => p.slug !== slug);

  return (
    <main className="min-h-screen bg-(--primary-bg-color)">
      {/* Navigation */}
      <div className="sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link href="/" prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/directory">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/directory/products">
                  Products
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/directory/products/brands/${clinic.brand}`}
                >{`${clinic.brand}`}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{`${clinic.slug}`}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        {/* Profile Header */}
        <ProfileHeader clinic={clinic} />

        <div className="px-4 md:px-0">
          <PractitionerTabs />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="order-2 lg:order-1 col-span-1 lg:col-span-12">
              <ClinicDetailsMarkdown clinic={clinic} />
            </div>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">{`Browse more ${clinic.product_category}`}</h2>
        <ItemsGrid items={similarProducts} />
        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments`}</h3>
          <MoreItems items={uniqueTreatments} />
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Cities in the UK`}</h3>
          <MoreItems items={locations} />
        </div>
      </div>
    </main>
  );
}

// export async function generateStaticParams() {

//   const filePath = path.join(process.cwd(), 'public', 'derms_processed.json');
//   const fileContents = fs.readFileSync(filePath, 'utf-8');
//   const clinics: Practitioner[] = JSON.parse(fileContents);
//   return clinics.map((clinic) => ({
//     slug: clinic.practitioner_name,
//   }));
// }

// export async function generateMetadata({ params }: ProfilePageProps) {
//   const filePath = path.join(process.cwd(), "public", "products_processed_new.json");
//   const fileContents = fs.readFileSync(filePath, "utf-8");
//   const clinics: Product[] = JSON.parse(fileContents);
//   const clinic = clinics.find((p) => p.slug === params.slug);

//   if (!clinic) {
//     return {
//       title: "Practitioner Not Found",
//     };
//   }

//   const clinicName = clinic.slug;

//   return {
//     title: `${clinicName.replaceAll("-", " ")}`,
//     description: `View ${clinicName}, a product of ${clinic.brand} in the ${clinic.product_category} segment.`,
//     openGraph: {
//       title: `${clinicName} - Consentz`,
//       description: `View ${clinicName}, a product of ${clinic.brand} in the ${clinic.product_category} segment.`,
//       images: [
//         {
//           url: clinic.image_url || "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: `${clinicName} profile picture`,
//         },
//       ],
//     },
//   };
// }

export async function generateMetadata({ params }: ProfilePageProps) {
  const clinic = await getProductBySlug(params.slug);
  const brandSlug = decodeURIComponent(params.brand).toLowerCase();
  const productSlug = decodeURIComponent(params.slug).toLowerCase();
  const canonicalUrl = toDirectoryCanonical(`/products/brands/${brandSlug}/${productSlug}`);

  if (!clinic) {
    return {
      title: "Product Not Found",
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const clinicName = clinic.slug;

  return {
    title: `${clinicName.replaceAll("-", " ")}`,
    description: `View ${clinicName}, a product of ${clinic.brand} in the ${clinic.product_category} segment.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${clinicName} - Consentz`,
      description: `View ${clinicName}, a product of ${clinic.brand} in the ${clinic.product_category} segment.`,
      images: [
        {
          url: clinic.image_url || "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${clinicName} profile picture`,
        },
      ],
    },
  };
}
