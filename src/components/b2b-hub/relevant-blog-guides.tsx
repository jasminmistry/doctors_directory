import Image from "next/image"
import { HUB_BLOG_LINKS } from "@/lib/b2b-hub/hub-blog-links"

export function RelevantBlogGuides() {
  return (
    <section className="bg-white px-4 md:px-6 py-12 md:py-16 mt-10 max-w-7xl mx-auto">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-neutral-900 mb-10 tracking-tight">
          Related Articles
        </h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {HUB_BLOG_LINKS.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video bg-neutral-100">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[10px] font-bold tracking-[0.12em] text-neutral-500 mb-3">
                  CONSENTZ
                </span>
                <span className="font-semibold text-neutral-900 text-base leading-snug group-hover:underline underline-offset-2">
                  {post.title}
                </span>
                <span className="text-sm text-neutral-500 mt-auto pt-4">
                  {post.date}
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <a
            href="https://www.consentz.com/blog/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-900 transition-colors"
          >
            View all blogs
          </a>
        </div>
      </div>
    </section>
  )
}
