jest.mock('next/server', () => ({
  NextResponse: class MockNextResponse {
    constructor(
      public body: string,
      public init?: { headers?: Record<string, string> }
    ) {}
  },
}))

import {
  getB2cSitemapIndexFiles,
  getDirectoryCrawlSitemapUrls,
  getDirectoryRobotsDisallowPaths,
} from '@/lib/directory-crawl-sitemaps'

describe('directory crawl sitemaps', () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const originalHold = process.env.NEXT_PUBLIC_HOLD_PRODUCT_SITEMAPS

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://www.consentz.com'
    delete process.env.NEXT_PUBLIC_HOLD_PRODUCT_SITEMAPS
  })

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_URL
    } else {
      process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
    }
    if (originalHold === undefined) {
      delete process.env.NEXT_PUBLIC_HOLD_PRODUCT_SITEMAPS
    } else {
      process.env.NEXT_PUBLIC_HOLD_PRODUCT_SITEMAPS = originalHold
    }
  })

  test('lists B2C and B2B indexes plus child sitemaps for robots', () => {
    const urls = getDirectoryCrawlSitemapUrls()
    expect(urls[0]).toBe('https://www.consentz.com/directory/sitemap.xml')
    expect(urls[1]).toBe('https://www.consentz.com/directory/business-sitemap.xml')
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://www.consentz.com/directory/all-clinics.xml',
        'https://www.consentz.com/directory/business-expansion-city1.xml',
        'https://www.consentz.com/directory/business-hub.xml',
      ])
    )
    expect(urls.length).toBeGreaterThan(40)
  })

  test('prefixes robots disallow paths with /directory', () => {
    expect(getDirectoryRobotsDisallowPaths()).toEqual(
      expect.arrayContaining([
        '/directory/admin/',
        '/directory/api/',
        '/directory/practitioners/*/profile/',
      ])
    )
  })

  test('exposes filtered B2C index file list', () => {
    expect(getB2cSitemapIndexFiles()).toContain('all-clinics.xml')
    expect(getB2cSitemapIndexFiles()).not.toContain('all-practitioners.xml')
  })
})
