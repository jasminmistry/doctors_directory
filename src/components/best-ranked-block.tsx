"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FallbackImage } from "@/components/ui/fallback-image"
import type { RankedEntry } from "@/lib/best-ranked"

interface BestRankedBlockProps {
  title: string
  entries: RankedEntry[]
}

type CardLabel =
  | "🥇 Best Overall"
  | "💰 Best Value"
  | "🏆 Premium Choice"
  | "⭐ Most Reviewed"

const labelPriority: CardLabel[] = [
  "🥇 Best Overall",
  "💰 Best Value",
  "🏆 Premium Choice",
  "⭐ Most Reviewed",
]

const badgeClassByLabel: Record<CardLabel, string> = {
  "🥇 Best Overall": "bg-amber-100 text-amber-900 border-amber-200",
  "💰 Best Value": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "🏆 Premium Choice": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "⭐ Most Reviewed": "bg-sky-100 text-sky-800 border-sky-200",
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

  assign(pickIndex(entries, (entry) => entry.scoreValue, used, "max"), "🥇 Best Overall")
  assign(pickPriceIndex(entries, used, "min", allPrices), "💰 Best Value")
  assign(pickPriceIndex(entries, used, "max", allPrices), "🏆 Premium Choice")
  assign(
    pickIndex(entries, (entry) => entry.reviewCount, used, "max"),
    "⭐ Most Reviewed"
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

    const nextLabel = remainingLabels.shift() ?? "🥇 Best Overall"
    labelsByIndex.set(index, nextLabel)
  }

  return entries.map((_, index) => labelsByIndex.get(index) ?? "🥇 Best Overall")
}

export function BestRankedBlock({ title, entries }: Readonly<BestRankedBlockProps>) {
  if (entries.length === 0) {
    return null
  }

  const cardLabels = buildCardLabels(entries)

  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {entries.map((entry, index) => (
          <article
            key={`${entry.href}-${index}`}
            className="relative flex flex-col bg-white border border-[#C4C4C4] rounded-md"
          >
            {/* Image + rank badge + name + score + price */}
            <div className="flex flex-col items-center text-center px-3 pt-4 pb-2">
              <div className="relative w-[80px] h-[80px] flex items-center justify-center overflow-visible rounded-full bg-gray-300 mb-3">
                <FallbackImage src={entry.image} alt={entry.name} className="object-cover rounded-full min-w-full min-h-full" />
              </div>
              <Link
                href={entry.href}
                prefetch={false}
                className="block text-sm font-semibold text-primary line-clamp-2 hover:underline underline-offset-2"
              >
                {entry.name}
              </Link>
              <p className="text-sm font-bold text-foreground mt-2">{entry.displayPrice}</p>
            </div>

            {/* Value badge + View Profile button */}
            <div className="px-3 pb-3 mt-auto flex flex-col gap-2">
              <div className="flex justify-center">
                <Badge variant="outline" className={`text-xs ${badgeClassByLabel[cardLabels[index]]}`}>
                  {cardLabels[index]}
                </Badge>
              </div>
              <Link href={entry.href} prefetch={false}>
                <Button className="w-full flex border rounded-lg px-4 py-2 bg-black text-white hover:bg-white hover:text-black cursor-pointer justify-center text-sm">
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
