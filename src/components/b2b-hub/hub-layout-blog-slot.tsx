"use client";

import { usePathname } from "next/navigation";
import { RelevantBlogGuides } from "@/components/b2b-hub/relevant-blog-guides";

function pathWithoutBase(pathname: string) {
  const n = pathname.replace(/\/$/, "") || "/";
  if (n.startsWith("/directory")) {
    const rest = n.slice("/directory".length) || "/";
    return rest;
  }
  return n;
}

function shouldHideBlogSlot(path: string) {
  if (/^\/business\/(software|cqc)\/.+/.test(path)) {
    return true;
  }
  if (/^\/business\/alternatives\/.+/.test(path)) {
    return true;
  }
  if (/^\/business\/automation\//.test(path) && !/-automation-alternative\/?$/.test(path)) {
    return true;
  }
  if (/^\/business\/migrate\/from-[^/]+\/?$/.test(path)) {
    return true;
  }
  if (/^\/business\/templates(\/|$)/.test(path)) {
    return true;
  }
  if (/^\/business\/compare\//.test(path)) {
    return true;
  }
  if (/^\/business\/practitioners\//.test(path)) {
    return true;
  }
  if (/^\/business\/consent\//.test(path)) {
    return true;
  }
  if (/^\/business\/uk\/[^/]+\/[^/]+/.test(path)) {
    return true;
  }
  return false;
}

export function HubLayoutBlogSlot() {
  const pathname = usePathname() ?? "";
  const p = pathWithoutBase(pathname);

  if (shouldHideBlogSlot(p)) {
    return null;
  }

  return (
    <div className="relative z-0 w-full shrink-0 bg-white pt-14 max-lg:mt-20 max-lg:pt-16 md:mt-16 md:pt-16">
      <RelevantBlogGuides />
    </div>
  );
}
