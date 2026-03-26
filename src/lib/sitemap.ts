import { NextResponse } from 'next/server'
import { toUrlSlug } from '@/lib/utils'

const DEFAULT_BASE_URL = 'https://staging.consentz.com'

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export const nowIso = (): string => new Date().toISOString()

export const getBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || DEFAULT_BASE_URL

export const toDirectoryUrl = (pathname: string): string => {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${getBaseUrl()}/directory${normalized}`
}

export const encodeSegment = (value: string): string =>
  encodeURIComponent(toUrlSlug(value))

export const encodeCitySegment = (value: string): string =>
  encodeSegment(value)

// Keep dynamic route params as a single path segment even when source text contains slash-like chars.
export const encodeSegmentForRouteParam = (value: string): string =>
  encodeSegment(value).replaceAll('%2F', '%252F').replaceAll('%5C', '%255C')

export const uniqueStrings = (
  values: ReadonlyArray<string | null | undefined>
): string[] => {
  const normalized = values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0)
  return [...new Set(normalized)]
}

const xmlEscape = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export const mapPathsToSitemapUrls = (
  paths: ReadonlyArray<string>,
  lastmod = nowIso(),
  changefreq: SitemapUrl['changefreq'] = 'weekly',
  priority = 0.7
): SitemapUrl[] =>
  paths.map((path) => ({
    loc: toDirectoryUrl(path),
    lastmod,
    changefreq,
    priority,
  }))

export const buildUrlSetXml = (urls: ReadonlyArray<SitemapUrl>): string => {
  const body = urls
    .map((url) => {
      const parts = [`    <loc>${xmlEscape(url.loc)}</loc>`]
      if (url.lastmod) parts.push(`    <lastmod>${xmlEscape(url.lastmod)}</lastmod>`)
      if (url.changefreq) {
        parts.push(`    <changefreq>${xmlEscape(url.changefreq)}</changefreq>`)
      }
      if (typeof url.priority === 'number') {
        parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`)
      }

      return ['  <url>', ...parts, '  </url>'].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`
}

export const buildSitemapIndexXml = (
  sitemapLocs: ReadonlyArray<string>,
  lastmod = nowIso()
): string => {
  const body = sitemapLocs
    .map(
      (loc) => `  <sitemap>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${xmlEscape(lastmod)}</lastmod>\n  </sitemap>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`
}

export const xmlResponse = (xml: string): NextResponse =>
  new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
