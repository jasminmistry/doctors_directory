"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FallbackImage, DEFAULT_PRODUCT } from "@/components/ui/fallback-image";
import { decodeUnicodeEscapes, toUrlSlug } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Product } from "@/lib/types";

const ITEMS_PER_PAGE = 9;

interface CategoryProductsGridProps {
  products: Product[];
  category: string;
}

export function CategoryProductsGrid({ products, category }: Readonly<CategoryProductsGridProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const pageProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const VISIBLE = 4;
    if (totalPages <= VISIBLE + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= VISIBLE) {
      for (let i = 1; i <= VISIBLE; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 1) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - VISIBLE + 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const categorySlug = toUrlSlug(category);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pageProducts.map((practitioner) => (
          <div key={practitioner.slug}>
            <Link
              prefetch={false}
              href={`/products/category/${categorySlug}/${practitioner.slug}`}
              className="block"
            >
              <Card className="group bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#BDBDBD] md:border-0 rounded-lg sm:bg-transparent sm:border-0 sm:hover:border-accent/50 sm:flex sm:flex-col sm:gap-5">
                <CardHeader className="pb-2 px-2">
                  <h2 id={`product-name-${practitioner.slug}`} className="sr-only">
                    {decodeUnicodeEscapes(practitioner.product_name)}
                  </h2>
                  <div className="flex items-start gap-4">
                    <div className="text-center flex-1 min-w-0 items-center flex flex-col">
                      <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
                        <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300 md:mb-4 mr-0">
                          <FallbackImage
                            src={practitioner.image_url?.replaceAll('"', "")}
                            alt={practitioner.product_name ?? "Product"}
                            className="object-cover rounded-lg min-w-full min-h-full"
                            fallback={DEFAULT_PRODUCT}
                          />
                        </div>
                        <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full">
                          {practitioner.product_name && (
                            <p className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-gray-200 text-[10px] px-3 py-1 mb-2">
                              {decodeUnicodeEscapes(practitioner?.distributor_cleaned.trim())}
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
                    <ul className="flex flex-wrap md:items-center md:justify-center gap-1 text-center" aria-label="Product prices">
                      {practitioner?.all_prices?.slice(0, 3).map((value: any, i: number) => (
                        <li key={i}>
                          <Badge variant="outline" className="text-[11px] font-normal text-gray-500">
                            {value.price}
                          </Badge>
                        </li>
                      ))}
                      {(practitioner?.all_prices?.length ?? 0) > 3 && (
                        <li>
                          <Badge variant="outline" className="text-[11px] font-normal text-gray-500">
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

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
