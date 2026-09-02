import {
  getSourceBucket,
  normalizeAppPath,
  parseAttrCookie,
  serializeAttrCookie,
  sourceBucketLabel,
  toAttributionColumns,
  type Attribution,
} from '@/lib/attribution'

describe('normalizeAppPath', () => {
  test('strips the /directory base path', () => {
    expect(normalizeAppPath('/directory/business/pricing')).toBe('/business/pricing')
    expect(normalizeAppPath('/directory')).toBe('/')
    expect(normalizeAppPath('/directory/')).toBe('/')
  })

  test('lower-cases, drops trailing slash and query/hash', () => {
    expect(normalizeAppPath('/Business/Pricing/')).toBe('/business/pricing')
    expect(normalizeAppPath('/search?q=botox#top')).toBe('/search')
  })
})

describe('getSourceBucket', () => {
  test('home', () => {
    expect(getSourceBucket('/directory')).toBe('home')
    expect(getSourceBucket('/directory/')).toBe('home')
    expect(getSourceBucket('/directory/features')).toBe('home')
    expect(getSourceBucket('/directory/register/clinic')).toBe('home')
  })

  test('business_hub', () => {
    expect(getSourceBucket('/directory/business')).toBe('business_hub')
    expect(getSourceBucket('/directory/business/pricing')).toBe('business_hub')
  })

  test('blog', () => {
    expect(getSourceBucket('/directory/blog/how-to-choose-a-clinic')).toBe('blog')
    expect(getSourceBucket('/directory/guides/botox')).toBe('blog')
    expect(getSourceBucket('/directory/articles/foo')).toBe('blog')
  })

  test('directory is the catch-all', () => {
    expect(getSourceBucket('/directory/london/clinic/some-clinic')).toBe('directory')
    expect(getSourceBucket('/directory/search')).toBe('directory')
    expect(getSourceBucket('/directory/treatments/botox')).toBe('directory')
  })
})

describe('dd_attr cookie codec', () => {
  const attribution: Attribution = {
    source: 'business_hub',
    landingPage: '/business/pricing',
    referrer: 'google.com',
    utmSource: 'newsletter',
    utmMedium: 'email',
    utmCampaign: 'jan-launch',
  }

  test('round-trips through serialize/parse', () => {
    const parsed = parseAttrCookie(serializeAttrCookie(attribution))
    expect(parsed).toEqual(attribution)
  })

  test('returns null for missing or junk values', () => {
    expect(parseAttrCookie(undefined)).toBeNull()
    expect(parseAttrCookie('')).toBeNull()
    expect(parseAttrCookie('not json')).toBeNull()
  })

  test('rejects an unknown source bucket', () => {
    const raw = encodeURIComponent(JSON.stringify({ s: 'facebook', lp: '/x' }))
    expect(parseAttrCookie(raw)?.source).toBeNull()
    expect(parseAttrCookie(raw)?.landingPage).toBe('/x')
  })

  test('clamps over-long fields', () => {
    const long = 'a'.repeat(1000)
    const parsed = parseAttrCookie(serializeAttrCookie({ ...attribution, landingPage: long }))
    expect(parsed?.landingPage?.length).toBe(512)
  })
})

describe('toAttributionColumns', () => {
  test('null attribution yields all-null columns', () => {
    expect(toAttributionColumns(null)).toEqual({
      attributionSource: null,
      attributionLandingPage: null,
      attributionReferrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    })
  })
})

describe('sourceBucketLabel', () => {
  test('maps known buckets and falls back to Unknown', () => {
    expect(sourceBucketLabel('business_hub')).toBe('Business Hub')
    expect(sourceBucketLabel('blog')).toBe('Blog / guides')
    expect(sourceBucketLabel(null)).toBe('Unknown')
    expect(sourceBucketLabel('nonsense')).toBe('Unknown')
  })
})
