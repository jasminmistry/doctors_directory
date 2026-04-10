"use client"

import { useState } from "react"

const DEFAULT_PERSON = "/directory/images/default-dr-profile-1.webp"
const DEFAULT_PRODUCT = "/directory/images/default-dr-profile-1.webp"

interface FallbackImageProps {
  src?: string | null
  alt: string
  className?: string
  fallback?: string
  width?: number
  height?: number
  loading?: "lazy" | "eager"
}

export function FallbackImage({
  src,
  alt,
  className,
  fallback = DEFAULT_PERSON,
  width,
  height,
  loading = "lazy",
}: Readonly<FallbackImageProps>) {
  const [imgSrc, setImgSrc] = useState(src || fallback)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={() => setImgSrc(fallback)}
    />
  )
}

export { DEFAULT_PERSON, DEFAULT_PRODUCT }
