import { SearchBar } from "@/components/search/search-bar";
import LogoLoop from "./LogoLoop";


export function HeroSection() {
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
          <div
            className="flex grid lg:grid-cols-2 items-center gap-12 mb-6 pt-10 pb-10">
            <div className="md:pt-5">
              <h1
                id="hero-heading"
                className="text-3xl md:text-5xl mb-6 text-[var(--mineshaft)] font-[var(--font-noto)]"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                The Premier Aesthetic Directory for Beauty & Wellbeing
              </h1>
              <p className="text-sm md:text-lg mb-8">
              Browse certified aethetic professionals, compare real patient reviews, and book your next treatment with total confidence.
              </p>
              <SearchBar />
              <div className="flex pt-4 md:pt-6 justify-center">
                <a href="/directory/search" className="font-medium hover:text-black">
                  Explore Aesthetics Directory →
                </a>
              </div>
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
