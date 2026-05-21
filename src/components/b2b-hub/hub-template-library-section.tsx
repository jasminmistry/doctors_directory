"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, CloudDownload, Search } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons"
import { HUB_TEMPLATE_LIBRARY_CARD_CLASS } from "@/components/b2b-hub/hub-marketing-typography"
import { HUB_BLEED_FROM_CONTAINER } from "@/components/b2b-hub/hub-hero-layout-classes"
import { cn } from "@/lib/utils"
import {
  type HubTemplateLibraryFormat,
  countHubTemplateLibraryByFormat,
  getHubTemplateLibraryItems,
  type HubTemplateLibraryItem,
} from "@/lib/b2b-hub/hub-template-library-data"
import type { TemplateCategory } from "@/lib/b2b-hub/templates-registry"

const FORMAT_TABS: { id: HubTemplateLibraryFormat; label: string }[] = [
  { id: "all", label: "All Formats" },
  { id: "carousels", label: "Carousels" },
  { id: "stories", label: "Stories" },
  { id: "reels", label: "Reels" },
  { id: "email", label: "Email" },
  { id: "forms", label: "Forms" },
  { id: "cqc", label: "CQC" },
]

const PAGE_SIZE = 8

function normalize(s: string) {
  return s.trim().toLowerCase()
}

type Props = {
  excludeSlug?: { category: TemplateCategory; slug: string }
  viewAllHref?: string
  showViewAll?: boolean
}

function TemplateLibraryCard({ item }: { item: HubTemplateLibraryItem }) {
  const inner = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E8E4DC]">
        <Image
          src={item.image}
          alt=""
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 text-left">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide bg-[#1A1A1A] text-white"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-base font-bold leading-snug text-[#111111] line-clamp-2 group-hover:text-neutral-700">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-[#6B6B6B]">{item.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#F0EDE8] pt-3 text-xs text-[#404040]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#111111]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-[10px] font-bold text-white">
              C
            </span>
            {item.author}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE9E3] px-2 py-1 font-medium text-[#111111]">
            <CloudDownload className="h-3.5 w-3.5" aria-hidden />
            {item.downloads} downloads
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {item.date}
          </span>
        </div>
      </div>
    </>
  )

  const className = HUB_TEMPLATE_LIBRARY_CARD_CLASS

  if (item.internal) {
    return (
      <Link href={item.href} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <a href={item.href} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  )
}

export function HubTemplateLibrarySection({
  excludeSlug,
  viewAllHref = "/business/templates/",
  showViewAll = true,
}: Props) {
  const items = useMemo(() => getHubTemplateLibraryItems(excludeSlug), [excludeSlug])
  const formatCounts = useMemo(() => countHubTemplateLibraryByFormat(items), [items])
  const [query, setQuery] = useState("")
  const [format, setFormat] = useState<HubTemplateLibraryFormat>("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = normalize(query)
    return items.filter((it) => {
      if (format !== "all" && it.format !== format) return false
      if (!q) return true
      const hay = `${it.title} ${it.description} ${it.tags.join(" ")}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, format])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const sliceStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(sliceStart, sliceStart + PAGE_SIZE)

  const tabCls = (active: boolean) =>
    `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 sm:text-[15px] ${
      active
        ? "bg-[#1A1A1A] text-white"
        : "border border-[#E2DDD7] bg-white text-[#111111] hover:border-neutral-400"
    }`

  const pageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = []
    const VISIBLE = 4
    if (pageCount <= VISIBLE + 2) {
      for (let i = 1; i <= pageCount; i++) pages.push(i)
    } else if (safePage <= VISIBLE) {
      for (let i = 1; i <= VISIBLE; i++) pages.push(i)
      pages.push("ellipsis", pageCount)
    } else if (safePage >= pageCount - 1) {
      pages.push(1, "ellipsis")
      for (let i = pageCount - VISIBLE + 1; i <= pageCount; i++) pages.push(i)
    } else {
      pages.push(1, "ellipsis")
      for (let i = safePage - 1; i <= safePage + 1; i++) pages.push(i)
      pages.push("ellipsis", pageCount)
    }
    return pages
  }

  return (
    <section
      className={cn(
        HUB_BLEED_FROM_CONTAINER,
        "mb-0 border-t border-[#E5E7EB] bg-white px-4 py-12 sm:px-6 sm:py-16 md:py-20"
      )}
    >
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-3 text-center text-[28px] font-bold leading-tight tracking-tight text-[#111111] md:text-[34px] md:leading-snug">
          Find The Right Template For Your Clinic
        </h2>
        <p className="mx-auto mb-10 max-w-[720px] text-center text-base leading-relaxed text-[#4a4a4a] md:text-lg">
          Professionally designed templates for every channel — carousels, reels, emails, forms, and
          compliance docs.
        </p>

        <div className="mx-auto mb-8 flex max-w-[720px] items-stretch gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="template-library-search">
            Search templates
          </label>
          <input
            id="template-library-search"
            type="search"
            placeholder="Search Templates"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
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

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {FORMAT_TABS.map((tab) => {
            const count = formatCounts[tab.id]
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFormat(tab.id)
                  setPage(1)
                }}
                className={tabCls(format === tab.id)}
              >
                {tab.label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pageItems.length === 0 ? (
            <p className="col-span-full py-12 text-center text-base text-[#6B6B6B]">
              No templates match your search. Try another format or clear the search field.
            </p>
          ) : (
            pageItems.map((it) => <TemplateLibraryCard key={it.id} item={it} />)
          )}
        </div>

        {pageCount > 1 ? (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  />
                </PaginationItem>
                {pageNumbers().map((n, i) => (
                  <PaginationItem key={n === "ellipsis" ? `e-${i}` : n}>
                    {n === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={n === safePage}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={safePage >= pageCount}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}

        {showViewAll ? (
          <div className="mt-10 flex justify-center">
            <Link href={viewAllHref} className={HUB_CTA_PRIMARY_CLASS}>
              View All
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
