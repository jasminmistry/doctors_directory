'use client'

import { HubLogoStrip } from '@/components/b2b-hub/hub-logo-strip'
import { SearchBar } from '@/components/search/search-bar'
import Link from 'next/link'

const HERO_IMAGE_SRC = '/directory/images/Consentz Aesthetic Clinic Directory.webp'

type Props = {
  title: string
  subtitle: string
}

export function DirectoryPatientHubHero({ title, subtitle }: Props) {
  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-4 md:pt-6">
        <div className="grid flex-1 grid-cols-1 items-start gap-4 text-center md:grid-cols-[3fr_2fr] md:gap-8 md:text-left">
          <div className="min-w-0">
            <h1
              className="mb-4 text-3xl text-[var(--mineshaft)] md:mb-6 md:text-5xl"
              style={{ fontFamily: 'var(--font-noto)' }}
            >
              {title}
            </h1>
            <p className="mb-6 text-sm md:mb-8 md:text-lg">{subtitle}</p>
            <div className="rounded-lg bg-white/80 md:pb-2">
              <SearchBar />
            </div>
            <div className="mt-5 flex flex-col items-center justify-start gap-3 md:flex-row md:items-center">
              <Link
                href="/account/login"
                className="w-[80%] items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 md:w-auto"
              >
                Join as a Patient - It&apos;s Free
              </Link>
              <Link
                href="/register/clinic"
                className="hidden items-center justify-center rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white md:inline-flex"
              >
                List your Practice
              </Link>
            </div>
          </div>
          <div>
            <figure className="flex justify-center">
              <img
                src={HERO_IMAGE_SRC}
                alt="Mobile app interface showing search functionality"
                width={400}
                height={400}
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full max-w-[160px] object-contain md:max-w-xs"
              />
              <figcaption className="sr-only">
                App interface showing search functionality
              </figcaption>
            </figure>
          </div>
        </div>
        <HubLogoStrip className="mt-auto shrink-0" />
      </div>
    </section>
  )
}
