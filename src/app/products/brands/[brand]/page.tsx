import Link from "next/link";
import { ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decodeUnicodeEscapes } from "@/lib/utils";
import { FallbackImage, DEFAULT_PRODUCT } from "@/components/ui/fallback-image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getProductsByBrand, getAllBrands } from "@/lib/data-access/products";
import { isRemovedBrandHub } from "@/lib/product-removals";
import { toDirectoryCanonical } from "@/lib/seo";
import { toUrlSlug } from "@/lib/utils";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: {
    brand: string;
  };
}

export async function generateMetadata({ params }: Readonly<ProfilePageProps>) {
  const brandSlug = decodeURIComponent(params.brand).toLowerCase();
  const brandName = decodeURIComponent(params.brand).replaceAll("-", " ");

  if (isRemovedBrandHub(brandSlug)) {
    return {
      title: "Brand Not Found",
      alternates: {
        canonical: toDirectoryCanonical(`/products/brands/${brandSlug}`),
      },
    };
  }

  return {
    title: `Top ${brandName} Aesthetic Products - Compare Prices & Reviews`,
    description: `Browse verified ${brandName} aesthetic products. Compare formulations, pricing and distributor information from a trusted UK directory.`,
    alternates: {
      canonical: toDirectoryCanonical(`/products/brands/${brandSlug}`),
    },
  };
}

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const rawBrand = decodeURIComponent(params.brand).replaceAll('%20', " ");

  if (isRemovedBrandHub(rawBrand)) {
    notFound();
  }

  // Resolve to the canonical brand name stored in the DB (handles slug-casing differences
  // e.g. URL "allergan" → DB "Allergan", URL "abbvie" → DB "AbbVie")
  const allBrands = await getAllBrands();
  const resolvedBrand =
    allBrands.find((b) => toUrlSlug(b) === toUrlSlug(rawBrand)) ?? rawBrand;

  const similarProducts = await getProductsByBrand(resolvedBrand);
  // Use the canonical brand name for all display purposes
  const brand = resolvedBrand;

  if (similarProducts.length === 0) {
    return (
      <main className="min-h-screen bg-(--primary-bg-color)">
        <div className="sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <Link href="/products/brands" prefetch={false}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Brands
              </Button>
            </Link>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl px-4 py-16 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-foreground">Brand not found</h1>
            <p className="text-gray-500 text-sm">
              We couldn&apos;t find any products for &ldquo;{brand}&rdquo;. Browse our top product brands below.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Product Brands</h2>
            <ul className="flex flex-wrap gap-2">
              {allBrands.map((b) => (
                <li key={b}>
                  <Link
                    href={`/products/brands/${toUrlSlug(b)}`}
                    className="inline-block px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm text-gray-700 hover:bg-black hover:text-white hover:border-black transition-colors"
                  >
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    );
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
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">
                  Products
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/products/brands/${toUrlSlug(brand)}`}
                >{brand}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        {/* Profile Header */}

        <h3 className="text-lg font-semibold text-foreground mb-2">{`${brand}`}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarProducts.map((practitioner, index) => (
            <div
              key={practitioner.slug}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                prefetch={false}
                href={`/products/brands/${toUrlSlug(brand)}/${practitioner.slug}`}
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
                          <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden md:mb-4 mr-0">
                            <FallbackImage
                              src={practitioner.image_url?.replaceAll('"', "")}
                              alt={practitioner.product_name ?? "Product"}
                              className="object-cover rounded-full min-w-full min-h-full"
                              fallback={DEFAULT_PRODUCT}
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
                        {practitioner?.all_prices
                          ?.slice(0, 3)
                          .map((value: any, i: number) => (
                            <li key={i}>
                              <Badge
                                variant="outline"
                                className="text-[11px] font-normal text-gray-500"
                              >
                                {value.price}
                              </Badge>
                            </li>
                          ))}

                        {(practitioner?.all_prices?.length ?? 0) > 3 && (
                          <li>
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal text-gray-500"
                            >
                              + {practitioner.all_prices.length - 3} more
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