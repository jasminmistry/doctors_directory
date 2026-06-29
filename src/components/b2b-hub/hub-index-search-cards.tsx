"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  HubIndexHeroSearch,
  HUB_INDEX_HERO_TITLE_CLASS_DEFAULT,
} from "@/components/b2b-hub/hub-index-hero-search"

export type HubIndexCardItem = {
  key: string
  href: string
  title: string
  subtitle: string
}

type Props = {
  heroTitle: string
  heroSubtitle?: string
  searchPlaceholder?: string
  entries: HubIndexCardItem[]
  heroTitleClassName?: string
  heroInputId?: string
}

export function HubIndexSearchCards({
  heroTitle,
  heroSubtitle,
  searchPlaceholder = "Search buyer hub",
  entries,
  heroTitleClassName,
  heroInputId = "hub-index-search",
}: Props) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return entries
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.subtitle.toLowerCase().includes(s)
    )
  }, [entries, q])

  return (
    <>
      <HubIndexHeroSearch
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        searchPlaceholder={searchPlaceholder}
        query={q}
        onQueryChange={setQ}
        inputId={heroInputId}
        heroTitleClassName={
          heroTitleClassName ?? HUB_INDEX_HERO_TITLE_CLASS_DEFAULT
        }
      />
      <section className="bg-white px-4 py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {filtered.map((e) => {
              const external = e.href.startsWith("http")
              const className =
                "w-full max-w-[404px] rounded-lg border border-[#e0e0e0] bg-[#fbfbfb] px-4 py-4 flex flex-col gap-1.5 hover:border-neutral-400  transition-all text-left min-h-[78px]"
              const body = (
                <>
                  <span className="font-semibold text-neutral-900 leading-snug">
                    {e.title}
                  </span>
                  <span className="text-sm text-neutral-600 leading-snug line-clamp-3">
                    {e.subtitle}
                  </span>
                </>
              )
              if (external) {
                return (
                  <a
                    key={e.key}
                    href={e.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {body}
                  </a>
                )
              }
              return (
                <Link key={e.key} href={e.href} className={className}>
                  {body}
                </Link>
              )
            })}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">
              No entries match &ldquo;{q}&rdquo;.
            </p>
          ) : null}
        </div>
      </section>
    </>
  )
}
