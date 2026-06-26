import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import { HUB_DETAIL_HERO_VIEWPORT_CLASS } from "@/lib/b2b-hub/hub-index-hero-layout"
import { cn } from "@/lib/utils"

type Props = {
  eyebrow: string
  title: string
  description: string
}

const HUB_HERO_IMAGE_SRC =
  "/directory/images/Consentz Aesthetic Clinic Directory.webp"

export function HubLocalizedPageHero({ eyebrow, title, description }: Props) {
  return (
    <section
      className={cn(
        "w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]",
        HUB_DETAIL_HERO_VIEWPORT_CLASS
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="grid flex-1 items-center gap-10 px-4 pt-8 md:gap-12 md:px-6 md:pt-12 lg:grid-cols-2 lg:items-center lg:pb-6 text-center md:text-left">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              {eyebrow}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight mb-4 [font-family:var(--font-playfair),Georgia,serif]">
              {title}
            </h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto md:mx-0 leading-relaxed">
              {description}
            </p>
          </div>
          <figure className="flex justify-center lg:justify-end order-first lg:order-none pt-2 lg:pt-0">
            <img
              src={HUB_HERO_IMAGE_SRC}
              alt=""
              className="max-w-[220px] sm:max-w-xs w-full h-auto object-contain"
            />
          </figure>
        </div>
        <HubLogoStrip className="mt-auto shrink-0" />
      </div>
    </section>
  )
}
