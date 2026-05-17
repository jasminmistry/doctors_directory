"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, CloudDownload, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons"
import {
  type HubTemplateLibraryFormat,
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
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 text-left">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag, i) => (
            <span
              key={tag}
              className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wide ${item.tagColors[i] ?? item.tagColors[0]}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-base font-bold leading-snug text-[#111111] line-clamp-2 group-hover:text-[#1a877a]">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-[#6B6B6B]">{item.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#F0EDE8] pt-3 text-xs text-[#6B6B6B]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#111111]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a877a] text-[10px] font-bold text-white">
              C
            </span>
            {item.author}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F2EE] px-2 py-1">
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

  const className =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2DDD7] bg-white shadow-sm transition-shadow hover:shadow-md"

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

  const pageNumbers = () => {
    const total = pageCount
    const cur = safePage
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const out: (number | "ellipsis")[] = []
    if (cur <= 3) {
      for (let i = 1; i <= 4; i++) out.push(i)
      out.push("ellipsis", total)
    } else if (cur >= total - 2) {
      out.push(1, "ellipsis")
      for (let i = total - 3; i <= total; i++) out.push(i)
    } else {
      out.push(1, "ellipsis", cur - 1, cur, cur + 1, "ellipsis", total)
    }
    return out
  }

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
          {FORMAT_TABS.map((tab) => (
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
            </button>
          ))}
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
