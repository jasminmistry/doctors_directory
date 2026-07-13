import type { MetadataRoute } from "next"
import { isProductSitemapCrawlHeld } from "@/lib/sitemap-crawl-hold"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com"

export default function robots(): MetadataRoute.Robots {
  const productDisallow = isProductSitemapCrawlHeld()
    ? ["/products/", "/products-brands-", "/products-categories-"]
    : []

  const sharedDisallow = [
    "/admin/",
    "/api/",
    "/zapain/",
    "/pain-relief/",
    "/practitioners/*/profile/",
    ...productDisallow,
  ]

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: sharedDisallow,
      },
      {
        userAgent: ["GPTBot", "Google-Extended", "ClaudeBot", "PerplexityBot"],
        allow: "/",
        disallow: sharedDisallow,
      },
    ],
    sitemap: [`${baseUrl}/directory/sitemap.xml`, `${baseUrl}/directory/business-sitemap.xml`],
    host: baseUrl,
  }
}
