import Link from 'next/link'

export type DirectoryCorridorCard = {
  key: string
  href: string
  title: string
  subtitle: string
}

type Props = {
  entries: DirectoryCorridorCard[]
}

export function DirectoryCorridorCards({ entries }: Props) {
  return (
    <section className="bg-white px-4 py-12 md:py-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.key}
              href={entry.href}
              className="flex min-h-[78px] w-full max-w-[404px] flex-col gap-1.5 rounded-lg border border-[#e0e0e0] bg-[#fbfbfb] px-4 py-4 text-left transition-all hover:border-neutral-400"
            >
              <span className="font-semibold leading-snug text-neutral-900">{entry.title}</span>
              <span className="line-clamp-3 text-sm leading-snug text-neutral-600">
                {entry.subtitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
