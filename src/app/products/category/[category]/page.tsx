import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decodeUnicodeEscapes, toUrlSlug } from "@/lib/utils";
import { product_categories } from "@/lib/data";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";
import fs from "fs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { readJsonFileSync } from "@/lib/json-cache"

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
  const similarProducts = clinics.filter((p) => p.category === category);




  if (!similarProducts) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarProducts.map((practitioner, index) => (
            <div
              key={practitioner.slug}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                prefetch={false}
                href={`/products/category/${toUrlSlug(category)}/${practitioner.slug}`}
                className="block"
              >
                <Card className="group bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#BDBDBD] md:border-0 rounded-lg sm:bg-transparent sm:border-0 sm:hover:border-accent/50 sm:flex sm:flex-col sm:gap-5">
                  <CardHeader className="pb-2 px-2">
                    <h2
                      id={`product-name-${practitioner.slug}`}
                      className="sr-only"
                    >
                      {decodeUnicodeEscapes(practitioner.product_name)}
                    </h2>
                    <div className="flex items-start gap-4">
                      <div className="text-center flex-1 min-w-0 items-center flex flex-col">
                        <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
                          <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300 md:mb-4 mr-0">
                            <img
                              src={
                                practitioner.image_url?.replaceAll('"', "") ||
                                "/placeholder.svg"
                              }
                              alt="Product"
                              className="object-cover rounded-lg min-w-full min-h-full"
                            />
                          </div>

                          <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full">
                            {practitioner.product_name && (
                              <p className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-gray-200 text-[10px] px-3 py-1 mb-2">
                                {decodeUnicodeEscapes(
                                  practitioner?.distributor_cleaned.trim(),
                                )}
                              </p>
                            )}

                            <h3 className="mb-2 md:mb-0 flex text-left md:text-center md:align-items-center md:justify-center font-semibold text-xs md:text-md leading-relaxed text-balance line-clamp-2">
                              {decodeUnicodeEscapes(practitioner.product_name)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 px-0 md:px-4 space-y-4">
                    <div className="flex md:items-center md:justify-center gap-2 text-[11px] text-gray-600">
                      <span className="text-pretty text-center">
                        {decodeUnicodeEscapes(practitioner.category.trim())}
                      </span>
                    </div>
                    <div>
                      <ul
                        className="flex flex-wrap md:items-center md:justify-center gap-1 text-center"
                        aria-label="Product prices"
                      >
                        {practitioner &&
                          practitioner?.all_prices
                            ?.slice(0, 3)
                            .map((value: any, index: number) => (
                              <li key={index}>
                                <Badge
                                  variant="outline"
                                  className="text-[11px] font-normal text-gray-500"
                                >
                                  {value.price}
                                </Badge>
                              </li>
                            ))}
                        {practitioner && (
                          <li key={index}>
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal text-gray-500"
                            >
                              + {practitioner?.all_prices?.length - 3} more
                            </Badge>
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
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

export async function generateMetadata({ params }: ProfilePageProps) {
  const clinics: Product[] = readJsonFileSync('products_processed_new.json');
const { category } = params;
  const similarProducts = clinics.filter((p) => p.product_category === category );


  if (!similarProducts) {
    return {
      title: "Product Cateogry Not Found",
    };
  }



  return {
    title: `${category} - Healthcare Directory`,
    description: `View the best prices in the ${category} segment.}`,
    openGraph: {
      title: `${category} - Consentz`,
      description: `View the best prices in the ${category} segment.`,
      images: [
        {
          url: similarProducts[0]?.image_url || "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${category} profile picture`,
        },
      ],
    },
  };
}
