"use client"

import { Search } from "lucide-react"

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
  searchPlaceholder = "Search resources",
  query,
  onQueryChange,
  inputId,
  heroTitleClassName = HUB_INDEX_HERO_TITLE_CLASS_DEFAULT,
}: Props) {
  return (
    <section className="bg-[var(--primary-bg-color)] px-4 pt-8 pb-10 md:pt-10 md:pb-14">
      <div className="max-w-[1280px] mx-auto text-center md:text-left">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="min-w-0">
            <h1 className={heroTitleClassName}>{heroTitle}</h1>
            {heroSubtitle ? (
              <p className="text-neutral-600 text-base md:text-lg max-w-3xl mx-auto md:mx-0 mb-8 md:mb-10 leading-relaxed">
                {heroSubtitle}
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto md:mx-0 items-stretch sm:items-center md:justify-start justify-center">
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
                className="shrink-0 inline-flex items-center justify-center rounded-lg bg-black text-white w-full sm:w-14 h-[52px] hover:bg-neutral-800 transition-colors"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <figure className="flex justify-center lg:justify-end order-first lg:order-none">
            <img
              src={HUB_HERO_IMAGE_SRC}
              alt=""
              className="max-w-[220px] sm:max-w-xs w-full h-auto object-contain"
            />
          </figure>
        </div>
      </div>
    </section>
  )
}
