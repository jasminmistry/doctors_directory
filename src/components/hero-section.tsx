"use client";
import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import LogoLoop from "./LogoLoop";
import { cn } from "@/lib/utils";
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";

export type HomeAudienceMode = "patient" | "clinic";

interface HeroSectionProps {
  mode: HomeAudienceMode;
  onModeChange: (mode: HomeAudienceMode) => void;
}

export function HeroSection({ mode, onModeChange }: HeroSectionProps) {
  const bookDemoHref = b2bBookDemoHref();
  const ratings = [
    {
      image: "/directory//images/softwareadvice.png",
      link: "https://www.softwareadvice.com/patient-case-management/consentz-profile/#reviews",
      alt: "Softwareadvice",
      width: "w-[60px] md:w-[120px]",
    },
    {
      image: "/directory//images/getapp.png",
      link: "https://www.getapp.com/healthcare-pharmaceuticals-software/a/consentz/",
      alt: "Getapp",
      width: "w-[45px] md:w-[75px]",
    },
    {
      image: "/directory/images/capterra.svg",
      link: "https://www.capterra.com/p/171328/Consentz/reviews/?utm_source=vendor&amp;utm_medium=badge&amp;utm_campaign=capterra_reviews_badge",
      alt: "Capterra",
      width: "w-[60px] md:w-[120px]",
    },
  ];

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
      src: "/directory/images/Prime.webp",
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
  ];

  return (
    <div>
      <main role="banner" className="relative">
        <section
          className="
          
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
          <div className="flex-1 flex items-center flex-col justify-top w-full ">
            <span className="block font-semibold text-xs pt-4 mb-[-10px]">I AM A</span>
            <div className="flex justify-center pt-4 pb-3">
              <div className="inline-flex items-center bg-white border rounded-full p-1 gap-0.5">
                <button
                  type="button"
                  onClick={() => onModeChange("clinic")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                    mode === "clinic"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-600 hover:text-black",
                  )}
                >
                  Provider
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange("patient")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                    mode === "patient"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-600 hover:text-black",
                  )}
                >
                  Patient
                </button>
              </div>
            </div>
            <div className="md:pt-5 w-full ">
              {mode === "patient" ? (
                <>
                  <div className="max-w-7xl w-full mx-auto text-center md:text-left md:px-6 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-8 items-start">
                    <div>
                        <h1
                          id="hero-heading"
                          className="text-3xl md:text-5xl mb-4 md:mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                          style={{ fontFamily: "var(--font-noto)" }}
                        >
                          Find elite Aesthetics & Wellness Practitioners near
                          you
                        </h1>
                        <p className="text-sm hidden md:block md:text-lg mb-6 md:mb-8">
                          Browse certified aesthetic professionals, compare real
                          patient reviews, and book your next treatment with total
                          confidence.
                        </p>
                        <div className="bg-white/80 md:pb-2 rounded-lg">
                          <SearchBar />
                        </div>

                        <div className="mt-5 flex flex-col md:flex-row items-center justify-start  gap-3">
                          <Link
                            href="/account/login"
                            className="w-[80%] md:w-auto items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                          >
                            Join as a Patient - It&apos;s Free
                          </Link>

                          <Link
                            href="/register/clinic"
                            className="hidden md:inline-flex items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
                          >
                            List your Practice
                          </Link>

                          <Link
                            href="/search"
                            className="hidden md:inline-flex text-sm text-gray-600 hover:text-black transition-colors"
                          >
                            Explore Aesthetics Directory →
                          </Link>
                        </div>
                    </div>
                    <div>
                      <figure className="flex justify-center">
                        <img
                          src="/directory/images/Consentz Aesthetic Clinic Directory.webp"
                          alt="Mobile app interface showing search functionality"
                          className="max-w-[160px] md:max-w-xs"
                        />
                        <figcaption className="sr-only">
                          App interface showing search functionality
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                </>
              ) : (
                <>
                  <div className="max-w-7xl w-full mx-auto text-center md:text-left md:px-6 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-8 items-start">

                    <div>
                      <div className="max-w-2xl">
                        <h1
                          id="hero-heading"
                          className="text-3xl md:text-5xl mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                          style={{ fontFamily: "var(--font-noto)" }}
                        >
                          Get found. Get qualified enquiries. Get booked.
                        </h1>
                        <p className="block text-sm md:text-lg mb-4 md:mb-8">
                          The patient-growth system for Aesthetic & Wellness practitioners.
                        </p>
                      </div>

                      <div className="max-w-4xl m-auto mt-5 flex flex-col sm:flex-row items-center justify-start gap-3">
                        <Link
                          href="/register/clinic"
                          className="w-[80%] md:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                        >
                          List your Practice
                        </Link>
                        <a
                            href={bookDemoHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=
                                "inline-flex h-auto w-[80%] md:w-auto items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
                          >
                            Book Demo
                          </a>
                      </div>
                        <div className="hidden md:inline-flex pt-6 flex flex-wrap justify-center lg:justify-start gap-6">
                          {ratings.map((rating, index) => (
                            <a
                              key={index}
                              href={rating.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-center"
                            >
                              <img
                                src={rating.image}
                                alt={rating.alt}
                                className={`${rating.width} h-auto object-contain transition-transform duration-300 hover:scale-[1.02]`}
                              />
                            </a>
                          ))}
                        </div>
                    </div>
                    <div>

                      <figure className="flex justify-center">
                        <img
                          src="/directory/images/Consentz Aesthetic Clinic Directory.webp"
                          alt="Mobile app interface showing search functionality"
                          className="max-w-[160px] md:max-w-xs"
                        />
                        <figcaption className="sr-only">
                          App interface showing search functionality
                        </figcaption>
                      </figure>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
          <aside
            aria-label="Partner and certification logos"
            className="w-full py-5 md:py-10 lg:py-15 mt-auto flex justify-center"
          >
            <LogoLoop
              logos={imageLogos}
              speed={60}
              direction="left"
              logoHeight={40}
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
