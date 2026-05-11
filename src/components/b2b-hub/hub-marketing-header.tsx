import Link from "next/link"
import Image from "next/image"

const site = "https://www.consentz.com"
const bookDemoHref = `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"}/book-demo`

export function HubMarketingHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 min-h-[56px] flex items-center justify-between gap-4 py-3">
        <Link href={site} className="shrink-0 relative h-9 w-[140px]" prefetch={false}>
          <Image
            src="/images/Consentz Logo.webp"
            alt="Consentz"
            fill
            className="object-contain object-left"
            sizes="140px"
            priority
          />
        </Link>
        <nav className="hidden sm:flex flex-1 items-center justify-center gap-6 md:gap-10 text-[11px] md:text-xs font-semibold tracking-[0.08em] text-neutral-800">
          <a href={site} className="hover:text-neutral-950 transition-colors">
            HOME
          </a>
          <a href={`${site}/features`} className="hover:text-neutral-950 transition-colors">
            FEATURES
          </a>
          <a href={`${site}/blog`} className="hover:text-neutral-950 transition-colors">
            BLOG
          </a>
          <a href={`${site}/faqs`} className="hover:text-neutral-950 transition-colors">
            FAQS
          </a>
        </nav>
        <a
          href={bookDemoHref}
          className="shrink-0 inline-flex items-center justify-center rounded-md border-2 border-neutral-900 px-4 py-2 text-[11px] font-semibold tracking-wide text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          BOOK DEMO
        </a>
      </div>
    </header>
  )
}
