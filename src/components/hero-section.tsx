"use client";
import { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import LogoLoop from "./LogoLoop";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const [mode, setMode] = useState<"patient" | "clinic">("patient");

  const imageLogos = [
    {
      src: "/directory/images/Aesthetic-Medicine.webp",
      alt: "",
      href: "",

    },
    {
      src: "/directory/images/Galderma.webp",
      alt: "",
      href: "",
    },
    {
      src: "/directory/images/Save Face.webp",
      alt: "",
      href: "",
    },
    {
      src: "/directory/images/Awards.webp",
      alt: "",
      href: "",
    },
    {
      src: "/directory/images/Prime.webp",
      alt: "",
      href: "",
    },
  ];

  return (
    <div className="bg-[var(--primary-bg-color)]">
      <main role="banner">
        <section
          className="
          bg-[var(--primary-bg-color)]
          max-w-7xl
          text-center
          md:text-left
          mx-auto
          px-6
          pt-4
          pb-6
          md:pt-6
          md:pb-4
          items-center"
          aria-labelledby="hero-heading"
        >
          {/* Clinic / Patient switcher */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
              <button
                type="button"
                onClick={() => setMode("patient")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                  mode === "patient"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-500 hover:text-black"
                )}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setMode("clinic")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                  mode === "clinic"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-500 hover:text-black"
                )}
              >
                Clinic
              </button>
            </div>
          </div>

          <div className="flex grid lg:grid-cols-2 items-center gap-12 mb-6 pt-10 pb-10">
            <div className="md:pt-5">
              {mode === "patient" ? (
                <>
                  <h1
                    id="hero-heading"
                    className="text-3xl md:text-5xl mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                    style={{ fontFamily: "var(--font-noto)" }}
                  >
                    Find top-rated Aesthetics & Wellness Practitioners near you
                  </h1>
                  <p className="text-sm md:text-lg mb-8">
                    Browse certified aesthetic professionals, compare real patient reviews, and book your next treatment with total confidence.
                  </p>
                  <SearchBar />
                  <div className="flex pt-4 md:pt-6 justify-center md:justify-start">
                    <a href="/directory/search" className="font-medium hover:text-black">
                      Explore Aesthetics Directory →
                    </a>
                  </div>
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                    <Link
                      href="/account/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                      Join as a patient — it&apos;s free
                    </Link>
                    <Link
                      href="/register/clinic"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
                    >
                      List your practice
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1
                    id="hero-heading"
                    className="text-3xl md:text-5xl mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                    style={{ fontFamily: "var(--font-noto)" }}
                  >
                    Grow your aesthetic practice with the UK&apos;s premier directory
                  </h1>
                  <p className="text-sm md:text-lg mb-8">
                    Reach thousands of patients actively looking for treatments. Showcase your expertise, collect verified reviews, and fill your calendar.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                    <Link
                      href="/register/clinic"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                      List your practice
                    </Link>
                    <Link
                      href="/claim"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
                    >
                      Claim your profile
                    </Link>
                    <Link
                      href="/register/practitioner"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
                    >
                      Register as practitioner
                    </Link>
                  </div>
                </>
              )}
            </div>
            <figure className="flex justify-center">
              <img
                src="/directory/images/Consentz Aesthetic Clinic Directory.webp"
                alt="Mobile app interface showing search functionality"
                className="max-w-xs"
              />
              <figcaption className="sr-only">App interface showing search functionality</figcaption>
            </figure>
          </div>
          <aside aria-label="Partner and certification logos" className="flex w-full">
            <LogoLoop
              logos={imageLogos}
              speed={60}
              direction="left"
              logoHeight={48}
              gap={110}
              hoverSpeed={0}
              scaleOnHover
              ariaLabel="Brands"
              className="py-10 md:py-15 relative"
            />
          </aside>
        </section>
      </main>
    </div>
  );
}
