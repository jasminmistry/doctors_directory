import Image from 'next/image'

interface CoverPhotoProps {
  src: string | null | undefined
  alt: string
}

export function CoverPhoto({ src, alt }: CoverPhotoProps) {
  if (!src) return null
  return (
    <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-gray-100">
      <Image src={src} alt={alt} fill className="object-cover" priority />
    </div>
  )
}
