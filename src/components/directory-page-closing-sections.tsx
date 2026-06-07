import Image from 'next/image'
import { HubSectionCta } from '@/components/b2b-hub/hub-section-cta'
import { HubServiceProviderSection } from '@/components/b2b-hub/hub-service-provider-section'
import {
  HUB_BTN_VIEW_ALL_BLOGS_CLASS,
  HUB_SURFACE_CARD_CLASS,
} from '@/components/b2b-hub/hub-marketing-typography'
import { HUB_BLOG_LINKS } from '@/lib/b2b-hub/hub-blog-links'

export function DirectoryPageClosingSections() {
  return (
    <>
      <article className="mx-auto w-full max-w-[1280px] min-w-0 bg-white px-4 pb-0">
        <HubServiceProviderSection />

        <section className="mb-16 text-center md:text-left">
          <h2 className="mb-3 text-3xl font-bold text-[#111111] md:text-4xl">Our Latest Blogs</h2>
          <p className="mb-10 max-w-[1280px] text-xl leading-snug text-[#1A1A1A]">
            Explore insights and tips to help you manage and grow your aesthetics clinic efficiently.
            Stay informed with our latest articles.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {HUB_BLOG_LINKS.slice(0, 3).map((post) => (
              <a
                key={post.id}
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className={HUB_SURFACE_CARD_CLASS}
              >
                <div className="relative h-[200px] w-full overflow-hidden bg-[#E8E6E2]">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 pb-6">
                  <span className="text-[15px] leading-snug text-[#111111] underline underline-offset-2">
                    {post.title}
                  </span>
                  <span className="text-sm text-[#111111] underline underline-offset-2">
                    Read More →
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
        </section>
      </article>
      <HubSectionCta />
    </>
  )
}
