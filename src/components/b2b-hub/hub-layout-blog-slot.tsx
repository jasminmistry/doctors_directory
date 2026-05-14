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
  if (/^\/business\/alternatives\/.+/.test(p)) {
    return null;
  }
  if (/^\/business\/automation\//.test(p) && !/-automation-alternative\/?$/.test(p)) {
    return null;
  }
  if (/^\/business\/migrate\/from-[^/]+\/?$/.test(p)) {
    return null;
  }
  if (/^\/business\/templates\//.test(p)) {
    return null;
  }
  // City scaled hub pages include their own blog strip; skip duplicate "Related Articles".
  if (/^\/business\/uk\/[^/]+\/[^/]+/.test(p)) {
    return null;
  }
  return <RelevantBlogGuides />;
}
