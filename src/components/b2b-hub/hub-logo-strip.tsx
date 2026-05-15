"use client"

import LogoLoop from "@/components/LogoLoop"

const HUB_PARTNER_LOGOS = [
  { src: "/directory/images/Aesthetic-Medicine.webp", alt: "", href: "" },
  { src: "/directory/images/Galderma.webp", alt: "", href: "" },
  { src: "/directory/images/Save Face.webp", alt: "", href: "" },
  { src: "/directory/images/Awards.webp", alt: "", href: "" },
  { src: "/directory/images/Prime.webp", alt: "", href: "" },
] as const

export function HubLogoStrip() {
  return (
    <aside aria-label="Partner and certification logos" className="w-full border-t border-[#E5E7EB]/80">
      <LogoLoop
        logos={[...HUB_PARTNER_LOGOS]}
        speed={60}
        direction="left"
        logoHeight={48}
        gap={110}
        hoverSpeed={0}
        scaleOnHover
        ariaLabel="Brands"
        className="py-8 md:py-10 relative"
      />
    </aside>
  )
}
