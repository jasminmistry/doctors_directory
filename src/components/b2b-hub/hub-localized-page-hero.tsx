type Props = {
  eyebrow: string
  title: string
  description: string
}

const HUB_HERO_IMAGE_SRC =
  "/directory/images/Consentz Aesthetic Clinic Directory.webp"

export function HubLocalizedPageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="w-full bg-[var(--primary-bg-color)] border-b border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-4 pt-8 md:pt-12 pb-10 md:pb-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start lg:items-center text-center md:text-left">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              {eyebrow}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4 [font-family:var(--font-playfair),Georgia,serif]">
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
      </div>
    </section>
  )
}
