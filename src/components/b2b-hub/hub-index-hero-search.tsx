"use client"

import { Search } from "lucide-react"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import {
  HUB_INDEX_HERO_TITLE_CLASS_DEFAULT,
  HUB_INDEX_HERO_VIEWPORT_CLASS,
} from "@/lib/b2b-hub/hub-index-hero-layout"
import { cn } from "@/lib/utils"

export {
  HUB_INDEX_HERO_TITLE_CLASS_DEFAULT,
  HUB_INDEX_HERO_TITLE_CLASS_SECTION,
  HUB_INDEX_HERO_VIEWPORT_CLASS,
} from "@/lib/b2b-hub/hub-index-hero-layout"

type Props = {
  heroTitle: string
  heroSubtitle?: string
  searchPlaceholder?: string
  query: string
  onQueryChange: (value: string) => void
  inputId: string
  heroTitleClassName?: string
  fillViewport?: boolean
  showSearch?: boolean
}

const HUB_HERO_IMAGE_SRC =
  "/directory/images/Consentz Aesthetic Clinic Directory.webp"

export function HubIndexHeroSearch({
  heroTitle,
  heroSubtitle,
  searchPlaceholder = "Search buyer hub",
  query,
  onQueryChange,
  inputId,
  heroTitleClassName = HUB_INDEX_HERO_TITLE_CLASS_DEFAULT,
  fillViewport = true,
  showSearch = true,
}: Props) {
  return (
    <section
      className={cn(
        "border-b border-[#e0e0e0] bg-[var(--primary-bg-color)]",
        fillViewport && HUB_INDEX_HERO_VIEWPORT_CLASS
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-full w-full max-w-7xl min-h-0 flex-col px-4 sm:px-6",
          fillViewport ? "min-h-[inherit] flex-1 pt-8 pb-0 md:pt-10" : "pt-6 pb-0 md:pt-8"
        )}
      >
        <div
          className={cn(
            "grid flex-1 items-center gap-10 pb-4 md:gap-12 lg:grid-cols-2 lg:pb-6",
            !showSearch && "min-h-[min(100%,28rem)] sm:min-h-[min(100%,32rem)]"
          )}
        >
          <div className="min-w-0 text-center md:text-left">
            <h1 className={heroTitleClassName}>{heroTitle}</h1>
            {heroSubtitle ? (
              <p
                className={cn(
                  "mx-auto max-w-3xl text-base leading-relaxed text-neutral-600 md:mx-0 md:text-lg",
                  showSearch ? "mb-8 md:mb-10" : "mb-0"
                )}
              >
                {heroSubtitle}
              </p>
            ) : null}
            {showSearch ? (
              <div className="mx-auto flex max-w-3xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:mx-0 md:justify-start">
                <label className="sr-only" htmlFor={inputId}>
                  Search
                </label>
                <input
                  id={inputId}
                  type="search"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black translation-focus"
                  autoComplete="off"
                />
                <button
                  type="button"
                  aria-label="Search"
                  className="inline-flex h-[52px] w-full shrink-0 items-center justify-center rounded-lg bg-black text-white hover:bg-neutral-800 hover:cursor-pointer transition-colors sm:w-14"
                >
                  <Search className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            ) : null}
          </div>
          <figure className="order-first flex justify-center lg:order-none lg:justify-end">
            <img
              src={HUB_HERO_IMAGE_SRC}
              alt=""
              width={400}
              height={400}
              decoding="async"
              fetchPriority="high"
              className="max-w-[220px] w-full h-auto object-contain sm:max-w-xs"
            />
          </figure>
        </div>
        <HubLogoStrip className="mt-auto shrink-0" />
      </div>
    </section>
  )
}
