import Image from "next/image"
import {
  CONSENTZ_MAIN_DIFFERENCE_BULLETS,
  competitorMainDifferenceBullets,
} from "@/lib/b2b-hub/hub-main-difference-copy"
import { cn } from "@/lib/utils"

const CONSENTZ_LOGO_SRC = "/directory/images/Consentz Logo.webp"

type Props = {
  competitorLabel: string
  className?: string
}

function BrandMark({ name, variant }: { name: string; variant: "consentz" | "competitor" }) {
  if (variant === "consentz") {
    return (
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-[#111111]">
        <Image
          src={CONSENTZ_LOGO_SRC}
          alt=""
          fill
          className="object-contain p-1"
          sizes="36px"
        />
      </div>
    )
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?"
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e8e4dc] text-sm font-bold text-[#111111]"
      aria-hidden
    >
      {initial}
    </div>
  )
}

function DifferenceCard({
  brand,
  variant,
  bullets,
}: {
  brand: string
  variant: "consentz" | "competitor"
  bullets: readonly string[]
}) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[#e6e0d8] bg-[#f5f3ee] p-8 md:p-9">
      <div className="flex items-center gap-3">
        <BrandMark name={brand} variant={variant} />
        <h3 className="text-xl font-bold text-[#111111] md:text-[22px]">{brand}</h3>
      </div>
      <ul className="flex flex-col gap-4">
        {bullets.map((line) => (
          <li
            key={line}
            className="flex gap-3 text-[15px] leading-[1.55] text-[#1a1a1a] md:text-base md:leading-[1.6]"
          >
            <span
              className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]"
              aria-hidden
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HubMainDifferenceSection({ competitorLabel, className }: Props) {
  const competitorBullets = competitorMainDifferenceBullets(competitorLabel)

  return (
    <section className={cn("mb-16", className)}>
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[#111111] md:mb-12 md:text-4xl md:leading-[44px]">
        What&apos;s The Main Difference?
      </h2>
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <DifferenceCard
          brand="Consentz"
          variant="consentz"
          bullets={CONSENTZ_MAIN_DIFFERENCE_BULLETS}
        />
        <DifferenceCard
          brand={competitorLabel}
          variant="competitor"
          bullets={competitorBullets}
        />
      </div>
    </section>
  )
}
