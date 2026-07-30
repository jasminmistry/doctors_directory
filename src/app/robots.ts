import type { MetadataRoute } from "next"
import {
  getDirectoryCrawlSitemapUrls,
  getDirectoryRobotsDisallowPaths,
} from "@/lib/directory-crawl-sitemaps"
import { getBaseUrl } from "@/lib/sitemap"

export default function robots(): MetadataRoute.Robots {
  const sharedDisallow = getDirectoryRobotsDisallowPaths()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/directory/",
        disallow: sharedDisallow,
      },
      {
        userAgent: ["GPTBot", "Google-Extended", "ClaudeBot", "PerplexityBot"],
        allow: "/directory/",
        disallow: sharedDisallow,
      },
    ],
    sitemap: getDirectoryCrawlSitemapUrls(),
    host: getBaseUrl(),
  }
}
