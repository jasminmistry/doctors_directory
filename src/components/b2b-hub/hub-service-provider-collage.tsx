import Image from "next/image"

const PHONE_FAN_BOUNDS = { w: 915.348, h: 846.025 } as const

const SERVICE_PROVIDER_LAYERS = [
  { src: "/directory/images/service-provider-collage/phone-1.png", l: 473.56, t: 0 },
  { src: "/directory/images/service-provider-collage/phone-2.png", l: 578.09, t: 101.42 },
  { src: "/directory/images/service-provider-collage/phone-3.png", l: 273.84, t: 245.73 },
  { src: "/directory/images/service-provider-collage/phone-4.png", l: 168.54, t: 144.32 },
  { src: "/directory/images/service-provider-collage/phone-5.png", l: 379.16, t: 347.15 },
  { src: "/directory/images/service-provider-collage/phone-1.png", l: 0, t: 454.71 },
  { src: "/directory/images/service-provider-collage/phone-2.png", l: 108.47, t: 557.33 },
] as const

function PhoneFanCollage({
  layers,
}: {
  layers: readonly { readonly src: string; readonly l: number; readonly t: number }[]
}) {
  const { w, h } = PHONE_FAN_BOUNDS
  const cellW = (337.258 / w) * 100
  const cellH = (288.695 / h) * 100
  return (
    <div
      className="relative mx-auto w-full aspect-[915/846] min-h-[220px] max-w-[400px] overflow-visible"
      aria-hidden
    >
      <div className="absolute inset-0">
        {layers.map(({ src, l, t }, i) => (
          <div
            key={`${src}-${i}`}
            className="absolute flex items-center justify-center"
            style={{
              left: `${(l / w) * 100}%`,
              top: `${(t / h) * 100}%`,
              width: `${cellW}%`,
              height: `${cellH}%`,
              zIndex: i,
            }}
          >
            <div
              className="relative overflow-hidden rounded-[7.66px] shadow-[0_14px_32px_rgba(0,0,0,0.14)]"
              style={{
                width: "40%",
                aspectRatio: "136.646 / 307.654",
                transform: "rotate(44deg) skewX(-6.96deg) scaleY(0.99)",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ServiceProviderCollage() {
  return <PhoneFanCollage layers={SERVICE_PROVIDER_LAYERS} />
}
