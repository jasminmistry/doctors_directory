"use client"

import Link from "next/link"
import { DirectoryStarRating } from "@/components/directory-star-rating"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FallbackImage } from "@/components/ui/fallback-image"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import type { RankedEntry } from "@/lib/best-ranked"

interface BestRankedBlockProps {
  title: string
  entries: RankedEntry[]
}

type CardLabel =
  | "Best Overall"
  | "Best Value"
  | "Premium Choice"
  | "Most Reviewed"

const labelPriority: CardLabel[] = [
  "Best Overall",
  "Best Value",
  "Premium Choice",
  "Most Reviewed",
]

const badgeClassByLabel: Record<CardLabel, string> = {
  "Best Overall": "bg-amber-100 text-amber-900 border-amber-200",
  "Best Value": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Premium Choice": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Most Reviewed": "bg-sky-100 text-sky-800 border-sky-200",
}

const pickIndex = (
  entries: RankedEntry[],
  selector: (entry: RankedEntry) => number,
  used: Set<number>,
  mode: "max" | "min"
): number | null => {
  let chosen: number | null = null

  for (let index = 0; index < entries.length; index += 1) {
    if (used.has(index)) {
      continue
    }

    if (chosen === null) {
      chosen = index
      continue
    }

    const current = selector(entries[index])
    const best = selector(entries[chosen])

    if (mode === "max" ? current > best : current < best) {
      chosen = index
    }
  }

  return chosen
}

const pickPriceIndex = (
  entries: RankedEntry[],
  used: Set<number>,
  mode: "max" | "min",
  allPrices: number[]
): number | null => {
  // Only assign a price label if there is meaningful price spread (>10% difference)
  if (allPrices.length < 2) return null
  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)
  if (maxP - minP < minP * 0.1) return null

  let chosen: number | null = null

  for (let index = 0; index < entries.length; index += 1) {
    if (used.has(index)) {
      continue
    }

    const price = entries[index].averagePrice
    if (price === null) {
      continue
    }

    if (chosen === null) {
      chosen = index
      continue
    }

    const bestPrice = entries[chosen].averagePrice
    if (bestPrice === null) {
      chosen = index
      continue
    }

    if (mode === "max" ? price > bestPrice : price < bestPrice) {
      chosen = index
    }
  }

  return chosen
}

const buildCardLabels = (entries: RankedEntry[]): CardLabel[] => {
  const labelsByIndex = new Map<number, CardLabel>()
  const used = new Set<number>()

  const assign = (index: number | null, label: CardLabel) => {
    if (index === null || used.has(index)) {
      return
    }

    labelsByIndex.set(index, label)
    used.add(index)
  }

  const allPrices = entries
    .map((e) => e.averagePrice)
    .filter((p): p is number => p !== null)

  assign(pickIndex(entries, (entry) => entry.scoreValue, used, "max"), "Best Overall")
  assign(pickPriceIndex(entries, used, "min", allPrices), "Best Value")
  assign(pickPriceIndex(entries, used, "max", allPrices), "Premium Choice")
  assign(
    pickIndex(entries, (entry) => entry.reviewCount, used, "max"),
    "Most Reviewed"
  )

  const remainingLabels = [...labelPriority]
  for (const label of labelsByIndex.values()) {
    const idx = remainingLabels.indexOf(label)
    if (idx >= 0) {
      remainingLabels.splice(idx, 1)
    }
  }

  for (let index = 0; index < entries.length; index += 1) {
    if (labelsByIndex.has(index)) {
      continue
    }

    const nextLabel = remainingLabels.shift() ?? "Best Overall"
    labelsByIndex.set(index, nextLabel)
  }

  return entries.map((_, index) => labelsByIndex.get(index) ?? "Best Overall")
}

export function BestRankedBlock({ title, entries }: Readonly<BestRankedBlockProps>) {
  if (entries.length === 0) {
    return null
  }

  const cardLabels = buildCardLabels(entries)

  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-4">
        {entries.map((entry, index) => (
          <article
            key={`${entry.href}-${index}`}
            className="relative flex flex-col bg-white border border-[#C4C4C4] rounded-lg"
          >
            {/* Image + rank badge + name + score + price */}
            <div className="flex flex-col items-center px-3 pt-4 pb-2 text-center">
              <div className="relative mx-auto mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200">
                <FallbackImage
                  src={null}
                  alt={entry.name}
                  className="h-full w-full object-cover"
                  width={80}
                  height={80}
                />
                {(entry.idVerified || entry.verified) && (
                  <span className="absolute bottom-0 right-0">
                    <VerifiedBadge idVerified={entry.idVerified} verified={entry.verified} />
                  </span>
                )}
              </div>
              <Link
                href={entry.href}
                prefetch={false}
                className="flex min-h-[2.5rem] w-full items-center justify-center text-sm font-semibold text-primary line-clamp-2 hover:underline underline-offset-2"
              >
                {entry.name}
              </Link>
              <p className="mt-1 min-h-[2rem] text-xs text-muted-foreground line-clamp-2">
                {entry.subtitle ?? "\u00A0"}
              </p>
              <div className="flex min-h-[2.5rem] w-full items-center justify-center">
                {entry.reviewCount > 0 ? (
                  <DirectoryStarRating
                    reviewCount={entry.reviewCount}
                    starClassName="h-3.5 w-3.5 fill-black text-black"
                    className="mt-2 flex-col items-center gap-1 text-xs"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Treatments starting from</p>
              <p className="min-h-[1.25rem] text-sm font-bold text-foreground">{entry.displayPrice}</p>
            </div>

            {/* Value badge + View Profile button */}
            <div className="px-3 pb-3 mt-auto flex flex-col gap-2">
              <div className="flex justify-center">
                <Badge variant="outline" className={`text-xs ${badgeClassByLabel[cardLabels[index]]}`}>
                  {cardLabels[index]}
                </Badge>
              </div>
              <Link href={entry.href} prefetch={false}>
                <Button className="whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive has-[>svg]:px-3 mb-0 w-full mt-4 h-auto sm:w-full inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 bg-black text-base font-medium text-white hover:bg-neutral-800 transition-colors capitalize hover:cursor-pointer">
                  View Profile
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
