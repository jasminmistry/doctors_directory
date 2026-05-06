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

  const segmentActive = (seg: HubSegment) =>
    p === `/business/${seg}` || p.startsWith(`/business/${seg}/`);

  return (
    <div className="border-b border-neutral-200 bg-neutral-50/80 mb-8">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/business/"
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-md transition-colors",
              hubHomeActive
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            Buyer hub
          </Link>
          {HUB_SEGMENTS.map((seg: HubSegment) => (
            <Link
              key={seg}
              href={`/business/${seg}/`}
              className={cn(
                "text-sm font-medium px-2 py-1 rounded-md transition-colors",
                segmentActive(seg)
                  ? "bg-black text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              {segmentLabel(seg)}
            </Link>
          ))}
          <Link
            href="/business/uk/"
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-md transition-colors",
              byCityActive
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            By city
          </Link>
        </div>
      </div>
    </div>
  );
}
