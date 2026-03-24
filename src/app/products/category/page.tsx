import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { readJsonFileSync } from "@/lib/json-cache";
import { product_categories } from "@/lib/data";
import { decodeUnicodeEscapes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
export default async function ProfilePage() {
  const clinics: Product[] = readJsonFileSync('products_processed_new.json');
 
 


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
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        {/* Profile Header */}

        <h3 className="text-lg font-semibold text-foreground mb-2">
          Top Categories
        </h3>
        <div className="bg--(--primary-bg-color) grid grid-cols-1 md:grid-cols-3 gap-6">
          {product_categories.map((brand, index) => {
            const itemDetail = clinics.find(
              (clinic) => clinic.category === brand,
            );
            return (
              <div key={brand} style={{ animationDelay: `${index * 50}ms` }}>
                <Link href={`/products/category/${brand}`} className="block">
                  <Card className="group bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#BDBDBD] md:border-0 rounded-lg sm:bg-transparent sm:border-0 sm:hover:border-accent/50 sm:flex sm:flex-col sm:gap-5">
                    <CardHeader className="pb-2 px-2">
                      <h2 id={`brand-${brand}`} className="text-center">
                        {brand}
                      </h2>
                      <div className="flex items-start gap-4">
                        <div className="text-center flex-1 min-w-0 items-center flex flex-col">
                          <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
                            <div className="w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg md:mb-4 mr-0">
                              <img
                                src={
                                  itemDetail?.image_url?.replaceAll('"', "") ||
                                  "/placeholder.svg"
                                }
                                alt="Product"
                                className="object-cover rounded-full min-w-full min-h-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            );
          })}
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

// export async function generateMetadata() {
//   const filePath = path.join(process.cwd(), "public", "products_processed_new.json");
//   const fileContents = fs.readFileSync(filePath, "utf-8");
//   const clinics: Product[] = JSON.parse(fileContents);





//   return {
//     title: `${category} - Healthcare Directory`,
//     description: `View the best prices in the ${category} segment.}`,
//     openGraph: {
//       title: `${category} - Consentz`,
//       description: `View the best prices in the ${category} segment.`,
//       images: [
//         {
//           url: similarProducts[0]?.image_url || "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: `${category} profile picture`,
//         },
//       ],
//     },
//   };
// }
