"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export function MoreItemsScroller({
  children,
  scrollAmount = 300,
}: {
  children: React.ReactNode;
  scrollAmount?: number;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const update = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    };

    update();
    container.addEventListener("scroll", update);
    return () => container.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="relative mt-4 pt-2">
      <div className="w-[90%] mx-auto">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth"
        >
          {children}
        </div>
      </div>

      {/* Always visible arrows */}
      <Button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-[#f4f4f4] border border-[#e0e0e0] text-[#1f1f1f] hover:bg-[#eeeeee] hover:border-[#d2d2d2] transition-colors disabled:opacity-50"
        disabled={!canScrollLeft}
      >
        <IconChevronLeft stroke={1.5} className="h-5 w-5" />
      </Button>

      <Button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-[#f4f4f4] border border-[#e0e0e0] text-[#1f1f1f] hover:bg-[#eeeeee] hover:border-[#d2d2d2] transition-colors disabled:opacity-50"
        disabled={!canScrollRight}
      >
        <IconChevronRight stroke={1.5} className="h-5 w-5" />
      </Button>
    </div>
  );
}
