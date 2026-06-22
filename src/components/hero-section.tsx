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
    <div>
      <main role="banner" className="relative">
        <section
          className="
          text-center
          md:text-left
          mx-auto
          px-6
          relative
          flex 
          flex-col
          items-center
          min-h-[calc(100vh-76px)]"
          aria-labelledby="hero-heading"
        >
          {/* Clinic / Patient switcher */}
          <div className="flex-1 flex items-center flex-col justify-center w-full">
            <div className="flex justify-center pt-4 pb-3">
              <div className="inline-flex items-center bg-white border rounded-full p-1 gap-0.5">
                <button
                  type="button"
                  onClick={() => setMode("patient")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                    mode === "patient"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:text-black",
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
                      : "text-gray-500 hover:text-black",
                  )}
                >
                  Clinic
                </button>
              </div>
            </div>

            <div className="md:pt-5 w-full text-center">
              {mode === "patient" ? (
                <>
                  <div className="max-w-2xl m-auto">
                    <h1
                      id="hero-heading"
                      className="text-3xl md:text-5xl mb-4 md:mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      Find top-rated Aesthetics & Wellness Practitioners near
                      you
                    </h1>
                    <p className="text-sm md:text-lg mb-6 md:mb-8">
                      Browse certified aesthetic professionals, compare real
                      patient reviews, and book your next treatment with total
                      confidence.
                    </p>
                  </div>
                  <div className="max-w-5xl m-auto bg-white/80 rounded-lg">
                    <SearchBar />
                  </div>
                  <div className="max-w-4xl m-auto px-5 mt-5 flex flex-col sm:flex-row items-center justify-center  gap-3">
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

                    <Link
                      href="/directory/search"
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      Explore Aesthetics Directory →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="max-w-2xl m-auto">
                    <h1
                      id="hero-heading"
                      className="text-3xl md:text-5xl mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      Grow your aesthetic practice with the UK&apos;s premier
                      directory
                    </h1>
                    <p className="text-sm md:text-lg mb-8">
                      Reach thousands of patients actively looking for treatments.
                      Showcase your expertise, collect verified reviews, and fill
                      your calendar.
                    </p>
                  </div>
                  <div className="max-w-4xl m-auto px-5 mt-5 flex flex-col sm:flex-row items-center justify-center  gap-3">
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
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      Register as practitioner  →
                    </Link>
                  </div>
                </>
              )}
            </div>
            {/* <figure className="flex justify-center">
                <img
                  src="/directory/images/Consentz Aesthetic Clinic Directory.webp"
                  alt="Mobile app interface showing search functionality"
                  className="max-w-xs"
                />
                <figcaption className="sr-only">App interface showing search functionality</figcaption>
              </figure> */}
          </div>
          <aside
            aria-label="Partner and certification logos"
            className="w-full py-10 md:py-15 mt-auto flex justify-center"
          >
            <LogoLoop
              logos={imageLogos}
              speed={60}
              direction="left"
              logoHeight={48}
              gap={110}
              hoverSpeed={0}
              scaleOnHover
              ariaLabel="Brands"
              className="relative"
            />
          </aside>
        </section>
      </main>
    </div>
  );
}
