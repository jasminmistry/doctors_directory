jest.mock('next/server', () => ({
  NextResponse: class MockNextResponse {
    constructor(
      public body: string,
      public init?: { headers?: Record<string, string> }
    ) {}
  },
}))

import {
  mapBusinessHubPathsToSitemapUrls,
  toBusinessHubUrl,
  toDirectoryUrl,
} from '@/lib/sitemap'

describe('sitemap URL builders', () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://www.consentz.com'
  })

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_URL
    } else {
      process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
    }
  })

  test('toBusinessHubUrl includes /directory prefix for B2B paths', () => {
    expect(toBusinessHubUrl('/business/uk/london/aesthetic-clinic-software/')).toBe(
      'https://www.consentz.com/directory/business/uk/london/aesthetic-clinic-software/'
    )
  })

  test('toBusinessHubUrl matches toDirectoryUrl for the same path', () => {
    const path = '/business/expansion/consent/botox/london/'
    expect(toBusinessHubUrl(path)).toBe(toDirectoryUrl(path))
  })

  test('mapBusinessHubPathsToSitemapUrls emits directory-prefixed loc values', () => {
    const urls = mapBusinessHubPathsToSitemapUrls(['/business/uk/'])
    expect(urls).toHaveLength(1)
    expect(urls[0]?.loc).toBe('https://www.consentz.com/directory/business/uk/')
    expect(urls[0]?.loc).not.toMatch(/^https:\/\/www\.consentz\.com\/business\//)
  })
})
