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

function ConsentzBrandLogo() {
  return (
    <Image
      src={CONSENTZ_LOGO_SRC}
      alt="Consentz"
      width={180}
      height={40}
      className="h-8 w-auto max-w-[180px] shrink-0 object-contain object-left sm:h-9 sm:max-w-[200px]"
      sizes="200px"
    />
  )
}

function CompetitorBrandMark({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?"
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8e4dc] text-sm font-medium text-[#111111]"
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
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-[#e6e0d8] bg-[#f5f3ee] p-6 sm:gap-5 sm:p-8 md:p-9">
      <div className="flex items-center justify-center gap-3 lg:justify-start">
        {variant === "consentz" ? (
          <ConsentzBrandLogo />
        ) : (
          <>
            <CompetitorBrandMark name={brand} />
            <h3 className="text-lg font-medium text-[#111111] sm:text-xl md:text-[22px]">{brand}</h3>
          </>
        )}
      </div>
      <ul className="flex flex-col gap-3 sm:gap-4">
        {bullets.map((line) => (
          <li
            key={line}
            className="flex gap-3 text-left text-sm leading-[1.55] text-[#1a1a1a] sm:text-[15px] md:text-base md:leading-[1.6]"
          >
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]"
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
    <section className={cn("mb-12 px-0 sm:mb-16", className)}>
      <h2 className="mb-8 px-2 text-center text-2xl font-semibold tracking-tight text-[#111111] sm:mb-10 sm:text-3xl md:text-4xl md:leading-[44px]">
        What&apos;s The Main Difference?
      </h2>
      <div className="mx-auto grid w-full min-w-0 max-w-[1120px] grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
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
