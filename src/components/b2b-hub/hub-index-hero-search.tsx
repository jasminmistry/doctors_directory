"use client"

import { Search } from "lucide-react"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"

export const HUB_INDEX_HERO_TITLE_CLASS_DEFAULT =
  "text-[40px] md:text-[44px] leading-tight md:leading-[52px] tracking-[-0.03em] text-[#111827] font-medium mb-4 md:mb-6 [font-family:var(--font-playfair),Georgia,serif]"

export const HUB_INDEX_HERO_TITLE_CLASS_SECTION =
  "text-[26px] md:text-[32px] leading-tight md:leading-[40px] tracking-[-0.02em] text-[#111827] font-semibold mb-4 md:mb-6 [font-family:var(--font-playfair),Georgia,serif]"

type Props = {
  heroTitle: string
  heroSubtitle?: string
  searchPlaceholder?: string
  query: string
  onQueryChange: (value: string) => void
  inputId: string
  heroTitleClassName?: string
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
}: Props) {
  return (
    <section className="border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-0 md:pt-10">
        <div className="grid items-center gap-10 pb-6 md:gap-12 lg:grid-cols-2 lg:pb-8">
          <div className="min-w-0 text-center md:text-left">
            <h1 className={heroTitleClassName}>{heroTitle}</h1>
            {heroSubtitle ? (
              <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-neutral-600 md:mx-0 md:mb-10 md:text-lg">
                {heroSubtitle}
              </p>
            ) : null}
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
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
                autoComplete="off"
              />
              <button
                type="button"
                aria-label="Search"
                className="inline-flex h-[52px] w-full shrink-0 items-center justify-center rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors sm:w-14"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <figure className="order-first flex justify-center lg:order-none lg:justify-end">
            <img
              src={HUB_HERO_IMAGE_SRC}
              alt=""
              className="max-w-[220px] w-full h-auto object-contain sm:max-w-xs"
            />
          </figure>
        </div>
        <HubLogoStrip />
      </div>
    </section>
  )
}
