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

export function HubLayoutBlogSlot() {
  const pathname = usePathname() ?? "";
  const p = pathWithoutBase(pathname);
  if (/^\/business\/(software|cqc)\/.+/.test(p)) {
    return null;
  }
  return <RelevantBlogGuides />;
}
