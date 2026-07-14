"use client"

import { useEffect, useState } from "react"

const DEFAULT_PERSON = "/directory/images/default-dr-profile-1.webp"
const DEFAULT_PRODUCT = "/directory/images/default-dr-profile-1.webp"

const PROXY_HOSTS = [
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  'maps.googleapis.com',
  'streetviewpixels-pa.googleapis.com',
]

function toProxiedSrc(src: string | null | undefined, fallback: string): string {
  if (!src) return fallback
  try {
    const { hostname } = new URL(src)
    if (PROXY_HOSTS.includes(hostname)) {
      return `/directory/api/img?url=${encodeURIComponent(src)}`
    }
  } catch {
    // not a valid URL — fall through
  }
  return src
}

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
  const resolved = toProxiedSrc(src, fallback)
  const [imgSrc, setImgSrc] = useState(resolved)

  useEffect(() => {
    setImgSrc(resolved)
  }, [resolved])

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
