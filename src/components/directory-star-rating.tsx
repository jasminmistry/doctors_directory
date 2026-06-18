import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  reviewCount: number
  reviewsLabel?: string
  starClassName?: string
  className?: string
}

export function DirectoryStarRating({
  reviewCount,
  reviewsLabel,
  starClassName = "h-4 w-4 fill-amber-500 text-amber-500",
  className,
}: Props) {
  if (reviewCount <= 0) return null

  const label =
    reviewsLabel ??
    `(${reviewCount} review${reviewCount === 1 ? "" : "s"})`

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 text-sm text-muted-foreground",
        className
      )}
      aria-label={`${reviewCount} reviews`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className={starClassName} />
        ))}
      </div>
      <span>{label}</span>
    </div>
  )
}
