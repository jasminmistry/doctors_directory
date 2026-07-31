import {
  HUB_BTN_VIEW_ALL_BLOGS_CLASS,
  HUB_SURFACE_CARD_CLASS,
} from "@/components/b2b-hub/hub-marketing-typography"
import Image from "next/image"
import { HUB_BLOG_LINKS } from "@/lib/b2b-hub/hub-blog-links"
import { cn } from "@/lib/utils"

export function RelevantBlogGuides() {
  return (
    <section className="relative z-0 mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-10 text-center text-2xl font-medium tracking-tight text-neutral-900 md:text-3xl">
          Related Articles
        </h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {HUB_BLOG_LINKS.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noreferrer"
              className={cn("group", HUB_SURFACE_CARD_CLASS)}
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
              <div className="flex flex-1 flex-col p-5">
                <span className="mb-3 text-[10px] font-medium tracking-[0.12em] text-neutral-500">
                  CONSENTZ
                </span>
                <span className="text-base font-semibold leading-snug text-neutral-900 underline-offset-2 group-hover:underline">
                  {post.title}
                </span>
                <span className="mt-auto pt-4 text-sm text-neutral-500">
                  {post.date}
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <a
            href="https://www.consentz.com/blog/"
            target="_blank"
            rel="noreferrer"
            className={HUB_BTN_VIEW_ALL_BLOGS_CLASS}
          >
            View All Blogs
          </a>
        </div>
      </div>
    </section>
  )
}
