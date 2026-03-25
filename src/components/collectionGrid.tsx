"use client"
import { PractitionerCard } from "@/components/practitioner-card"
import { useEffect, useRef, useState } from "react";
import { Product, Practitioner, Clinic } from "@/lib/types";
import { isCity, isTreatment } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Set to false to revert to infinite scroll
const USE_PAGINATION = true;

interface PractitionerCardProps {
  items: (Practitioner | Clinic | Product | string)[];
  customLink?: string;
}

export default function ItemsGrid({ items, customLink }: PractitionerCardProps) {
  const ITEMS_PER_PAGE = (isCity(items[0]) || isTreatment(items[0])) ? 24 : 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setLoadedCount(ITEMS_PER_PAGE);
  }, [items, ITEMS_PER_PAGE]);

  // Infinite scroll observer — active when USE_PAGINATION = false
  useEffect(() => {
    if (USE_PAGINATION) return;
    const node = sentinelRef.current;
    if (!node || loadedCount >= items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length));
        }
      },
      { rootMargin: "200px 0px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadedCount, items, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const itemsList = USE_PAGINATION
    ? items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : items.slice(0, loadedCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const VISIBLE = 4;
    if (totalPages <= VISIBLE + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= VISIBLE) {
      // Near the start: show first VISIBLE pages, ellipsis, last
      for (let i = 1; i <= VISIBLE; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 1) {
      // Near the end: show first, ellipsis, last VISIBLE pages
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - VISIBLE + 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Middle: show first, ellipsis, window around current, ellipsis, last
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full space-y-6">
      <div className="md:bg--(--primary-bg-color) grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {itemsList.map((clinic) => (
          <PractitionerCard
            key={typeof clinic === "string" ? clinic : ("practitioner_name" in clinic ? clinic.practitioner_name! + clinic.practitioner_title : clinic.slug)}
            practitioner={clinic}
            customLink={customLink}
          />
        ))}
      </div>
      {USE_PAGINATION ? (
        totalPages > 1 && (
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
        )
      ) : (
        loadedCount < items.length && (
          <div ref={sentinelRef} className="py-4 text-center">
            <p>Loading...</p>
          </div>
        )
      )}
    </div>
  );
}