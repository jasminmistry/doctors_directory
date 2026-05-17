"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons";
import {
  type HubTemplateLibraryFormat,
  HUB_TEMPLATE_LIBRARY_ITEMS,
} from "@/lib/b2b-hub/hub-template-library-data";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const FORMAT_TABS: { id: HubTemplateLibraryFormat; label: string }[] = [
  { id: "all", label: "All Formats" },
  { id: "carousels", label: "Carousels" },
  { id: "stories", label: "Stories" },
  { id: "reels", label: "Reels" },
  { id: "email", label: "Email" },
  { id: "forms", label: "Forms" },
  { id: "cqc", label: "CQC" },
];

const PAGE_SIZE = 8;

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function HubTemplateLibrarySection() {
  const items = HUB_TEMPLATE_LIBRARY_ITEMS;
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<HubTemplateLibraryFormat>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return items.filter((it) => {
      if (format !== "all" && it.format !== format) return false;
      if (!q) return true;
      return normalize(it.title).includes(q);
    });
  }, [items, query, format]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const sliceStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(sliceStart, sliceStart + PAGE_SIZE);

  if (items.length === 0) return null;

  const tabCls = (active: boolean) =>
    `rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5 sm:text-[15px] ${
      active
        ? "bg-[#1A1A1A] text-white"
        : "border border-[#E2DDD7] bg-white text-[#111111] hover:border-neutral-400"
    }`;

  const pageNumbers = () => {
    const total = pageCount;
    const cur = safePage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const out: (number | "ellipsis")[] = [];
    if (cur <= 3) {
      for (let i = 1; i <= 4; i++) out.push(i);
      out.push("ellipsis", total);
    } else if (cur >= total - 2) {
      out.push(1, "ellipsis");
      for (let i = total - 3; i <= total; i++) out.push(i);
    } else {
      out.push(1, "ellipsis", cur - 1, cur, cur + 1, "ellipsis", total);
    }
    return out;
  };

  return (
    <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#F2EEE6] px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-3 text-center text-[28px] font-bold leading-tight tracking-tight text-[#111111] md:text-[34px] md:leading-snug">
          Find The Right Template For Your Clinic
        </h2>
        <p className="mx-auto mb-10 max-w-[720px] text-center text-base leading-relaxed text-[#4a4a4a] md:text-lg">
          Professionally designed templates for every channel — carousels, reels, emails, forms, and
          compliance docs.
        </p>

        <div className="mx-auto mb-8 flex max-w-[720px] flex-col gap-3 sm:flex-row sm:items-stretch">
          <label className="sr-only" htmlFor="template-library-search">
            Search templates
          </label>
          <input
            id="template-library-search"
            type="search"
            placeholder="Search Templates"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="min-h-[52px] flex-1 rounded-xl border border-[#E2DDD7] bg-white px-4 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
          />
          <button
            type="button"
            className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#1A1A1A] text-white transition-colors hover:bg-neutral-900"
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-2.5">
          {FORMAT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFormat(tab.id);
                setPage(1);
              }}
              className={tabCls(format === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {pageItems.length === 0 ? (
            <p className="col-span-full py-12 text-center text-base text-[#6B6B6B]">
              No templates match your search. Try another format or clear the search field.
            </p>
          ) : (
            pageItems.map((it) => (
            <a
              key={it.id}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2DDD7] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4F2EE]">
                <Image
                  src={it.image}
                  alt=""
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="flex flex-col gap-1.5 border-t border-[#F0EDE8] px-3 py-3 text-left">
                <span className="line-clamp-3 text-sm font-semibold leading-snug text-[#111111]">
                  {it.title}
                </span>
                <span className="text-xs text-[#928B82]">{it.date}</span>
                <span className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
                  Download now
                </span>
              </div>
            </a>
            ))
          )
          }
        </div>

        {pageCount > 1 ? (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-1 text-sm font-medium text-[#6B6B6B]"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg px-2 py-2 hover:bg-white/80 disabled:opacity-40"
            >
              « Previous
            </button>
            {pageNumbers().map((n, i) =>
              n === "ellipsis" ? (
                <span key={`e-${i}`} className="px-2">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-w-[2.25rem] rounded-full px-3 py-2 transition-colors ${
                    n === safePage
                      ? "bg-[#1A1A1A] text-white"
                      : "hover:bg-white/80 text-[#111111]"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-lg px-2 py-2 hover:bg-white/80 disabled:opacity-40"
            >
              Next »
            </button>
          </nav>
        ) : null}

        <div className="mt-10 flex justify-center">
          <a
            href={`${baseUrl}/medical-templates/`}
            target="_blank"
            rel="noreferrer"
            className={HUB_CTA_PRIMARY_CLASS}
          >
            View All
          </a>
        </div>
      </div>
    </section>
  );
}
