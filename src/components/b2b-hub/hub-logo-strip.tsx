const HUB_PARTNER_LOGOS = [
  { src: "/directory/images/Aesthetic-Medicine.webp", alt: "Aesthetic Medicine" },
  { src: "/directory/images/Galderma.webp", alt: "Galderma" },
  { src: "/directory/images/Save Face.webp", alt: "Save Face" },
  { src: "/directory/images/Awards.webp", alt: "Awards" },
  { src: "/directory/images/Prime.webp", alt: "Prime" },
] as const

export function HubLogoStrip() {
  const track = [...HUB_PARTNER_LOGOS, ...HUB_PARTNER_LOGOS]

  return (
    <aside
      aria-label="Partner and certification logos"
      className="w-full border-t border-[#E5E7EB]/80 overflow-hidden"
    >
      <div className="py-8 md:py-10 relative overflow-hidden">
        <div className="hub-logo-marquee-track flex items-center gap-[110px] will-change-transform">
          {track.map((logo, i) => (
            <img
              key={`${logo.src}-${i}`}
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={48}
              className="h-12 w-auto max-w-[160px] shrink-0 object-contain"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
