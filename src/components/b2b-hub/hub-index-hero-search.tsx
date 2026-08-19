"use client"

import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import {
  HUB_CTA_PRIMARY_HERO_CLASS,
  HUB_CTA_SECONDARY_HERO_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import {
  HUB_INDEX_HERO_TITLE_CLASS_DEFAULT,
  HUB_INDEX_HERO_VIEWPORT_CLASS,
} from "@/lib/b2b-hub/hub-index-hero-layout"
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo"
import { cn } from "@/lib/utils"
import { IconSearch } from "@tabler/icons-react"
import Link from "next/link"

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
          <div className="min-w-0 text-left">
            <h1 className={heroTitleClassName}>{heroTitle}</h1>
            {heroSubtitle ? (
              <p
                className={cn(
                  "max-w-3xl text-base leading-relaxed text-neutral-600 md:text-lg",
                  showSearch ? "mb-8 md:mb-10" : "mb-0"
                )}
              >
                {heroSubtitle}
              </p>
            ) : null}
            {showSearch ? (
              <div className="w-full max-w-xl">
                <div className="flex items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <label className="sr-only" htmlFor={inputId}>
                    Search
                  </label>
                  <span className="flex items-center pl-3 text-neutral-400">
                    <IconSearch className="h-5 w-5" stroke={1.5} />
                  </span>
                  <input
                    id={inputId}
                    type="search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="min-w-0 flex-1 bg-white px-3 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    aria-label="Search"
                    className="inline-flex w-12 shrink-0 items-center justify-center bg-black text-white hover:bg-neutral-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </button>
                </div>
                <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
                  <Link href="/register/clinic" className={`inline-flex ${HUB_CTA_PRIMARY_HERO_CLASS}`}>
                    List your Practice
                  </Link>
                  <a
                    href={b2bBookDemoHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex ${HUB_CTA_SECONDARY_HERO_CLASS}`}
                  >
                    Book Demo
                  </a>
                </div>
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
