"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HUB_SEGMENTS,
  segmentLabel,
  type HubSegment,
} from "@/lib/b2b-hub/registry";

function pathWithoutBase(pathname: string) {
  const n = pathname.replace(/\/$/, "") || "/";
  if (n.startsWith("/directory")) {
    const rest = n.slice("/directory".length) || "/";
    return rest;
  }
  return n;
}

export function HubChrome() {
  const pathname = usePathname();
  const p = pathWithoutBase(pathname);

  const hubHomeActive = p === "/business";
  const byCityActive = p === "/business/uk" || p.startsWith("/business/uk/");
  const byTreatmentActive =
    p === "/business/treatments" || p.startsWith("/business/treatments/");

  const segmentActive = (seg: HubSegment) =>
    p === `/business/${seg}` || p.startsWith(`/business/${seg}/`);

  return (
    <div className="border-b border-[#E5E7EB] bg-[var(--primary-bg-color)] mb-0">
      <div className="mx-auto max-w-[1280px] px-4 py-2">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="navigation"
          aria-label="Buyer hub sections"
        >
          <Link
            href="/business/"
            className={cn(
              "shrink-0 whitespace-nowrap text-sm font-medium px-[13px] py-[5px] rounded-[12px] transition-colors",
              hubHomeActive
                ? "bg-[#111111] text-white"
                : "text-neutral-900 hover:bg-white/70"
            )}
          >
            Buyer Hub
          </Link>
          {HUB_SEGMENTS.map((seg: HubSegment) => (
            <Link
              key={seg}
              href={`/business/${seg}/`}
              className={cn(
                "shrink-0 whitespace-nowrap text-sm font-medium px-[13px] py-[5px] rounded-[12px] transition-colors",
                segmentActive(seg)
                  ? "bg-[#111111] text-white"
                  : "text-neutral-900 hover:bg-white/70"
              )}
            >
              {segmentLabel(seg)}
            </Link>
          ))}
          <Link
            href="/business/uk/"
            className={cn(
              "shrink-0 whitespace-nowrap text-sm font-medium px-[13px] py-[5px] rounded-[12px] transition-colors",
              byCityActive
                ? "bg-[#111111] text-white"
                : "text-neutral-900 hover:bg-white/70"
            )}
          >
            By City
          </Link>
          <Link
            href="/business/treatments/"
            className={cn(
              "shrink-0 whitespace-nowrap text-sm font-medium px-[13px] py-[5px] rounded-[12px] transition-colors",
              byTreatmentActive
                ? "bg-[#111111] text-white"
                : "text-neutral-900 hover:bg-white/70"
            )}
          >
            By Treatment
          </Link>
        </div>
      </div>
    </div>
  );
}
