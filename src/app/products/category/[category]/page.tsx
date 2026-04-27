import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { decodeUnicodeEscapes, toUrlSlug } from "@/lib/utils";
import { product_categories } from "@/lib/data";
import { Product } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { readJsonFileSync } from "@/lib/json-cache"
import { toDirectoryCanonical } from "@/lib/seo";
import { CategoryProductsGrid } from "./CategoryProductsGrid";

interface ProfilePageProps {
  params: {
    category: string;
  };
}

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const clinics: Product[] = readJsonFileSync('products_processed_new.json');
  let { category } = params;
  const resolvedCategory =
    product_categories.find((c) => toUrlSlug(c) === category) ??
    (() => {
      const decoded = category.replaceAll('%20', ' ');
      return product_categories.find((c) => c === decoded) ?? decoded;
    })();
  category = resolvedCategory;

  // Redirect if URL segment is not in lowercase-slug form (e.g. "Aesthetic Injectables" → "aesthetic-injectables")
  const categorySlug = toUrlSlug(resolvedCategory);
  if (params.category !== categorySlug) {
    redirect(`/products/category/${categorySlug}`);
  }

  const allProducts = clinics.filter((p) => p.category === category);




  if (allProducts.length === 0) {
    notFound();
  }

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
              <BreadcrumbLink href={`/directory/products/category`}>
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/directory/products/category/${toUrlSlug(category)}`}
              >{`${category}`}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        {/* Profile Header */}

        <h3 className="bg--(--primary-bg-color) text-lg font-semibold text-foreground mb-2">{`${category}`}</h3>
        <CategoryProductsGrid products={allProducts} category={category} />
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

export async function generateMetadata({ params }: ProfilePageProps) {
  const clinics: Product[] = readJsonFileSync('products_processed_new.json');
  const { category } = params;
  const canonicalCategory = decodeURIComponent(category).toLowerCase();

  const resolvedCategory =
    product_categories.find((c) => toUrlSlug(c) === category) ??
    (() => {
      const decoded = category.replaceAll('%20', ' ');
      return product_categories.find((c) => c === decoded) ?? decodeURIComponent(category).replaceAll("-", " ");
    })();

  const categoryProducts = clinics.filter((p) => p.category === resolvedCategory);

  if (categoryProducts.length === 0) {
    return { title: "Product Category Not Found" };
  }

  const sampleNames = categoryProducts
    .slice(0, 2)
    .map((p) => p.product_name)
    .filter(Boolean)
    .join(" and ");

  const description = sampleNames
    ? `Compare prices for ${sampleNames} and more. Access verified medical supplies and bulk pricing from multiple clinic distributors.`
    : `Explore the ${resolvedCategory} range. View pricing and find verified medical distributors for your clinic.`;

  return {
    title: `${resolvedCategory}: Compare Brands and Pricing`,
    description,
    alternates: {
      canonical: toDirectoryCanonical(`/products/category/${canonicalCategory}`),
    },
    openGraph: {
      title: `${resolvedCategory}: Compare Brands and Pricing`,
      description,
      images: [
        {
          url: categoryProducts[0]?.image_url || "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${resolvedCategory} products`,
        },
      ],
    },
  };
}
