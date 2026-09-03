import { parseCidFromGmapsUrl, resolveReviewLinkTarget, buildGoogleReviewUrl } from '@/lib/gbp/place-id'

describe('parseCidFromGmapsUrl', () => {
  test('extracts hex CID from a !1s place URL', () => {
    const url =
      'https://www.google.com/maps/place/Clinic/@51.5,-0.1,17z/data=!3m1!4b1!4m5!3m4!1s0x487604c4d1234567:0x89abcdef01234567!8m2'
    expect(parseCidFromGmapsUrl(url)).toBe(BigInt('0x89abcdef01234567').toString(10))
  })

  test('extracts decimal CID from ?cid=', () => {
    expect(parseCidFromGmapsUrl('https://maps.google.com/?cid=1234567890')).toBe('1234567890')
  })

  test('returns null for a URL with no CID', () => {
    expect(parseCidFromGmapsUrl('https://example.com')).toBeNull()
    expect(parseCidFromGmapsUrl(null)).toBeNull()
  })
})

describe('resolveReviewLinkTarget', () => {
  test('prefers an explicit placeId', () => {
    expect(resolveReviewLinkTarget({ placeId: 'ChIJxyz', gmapsUrl: 'https://maps.google.com/?cid=99' })).toEqual({
      kind: 'placeId',
      value: 'ChIJxyz',
    })
  })

  test('falls back to a parsed CID', () => {
    expect(resolveReviewLinkTarget({ placeId: null, gmapsUrl: 'https://maps.google.com/?cid=99' })).toEqual({
      kind: 'cid',
      value: '99',
    })
  })

  test('returns null when neither is available', () => {
    expect(resolveReviewLinkTarget({ placeId: '', gmapsUrl: null })).toBeNull()
  })
})

describe('buildGoogleReviewUrl', () => {
  test('newReviewUri always wins', () => {
    expect(
      buildGoogleReviewUrl({ newReviewUri: 'https://g.page/r/abc/review', clinic: { placeId: 'ChIJxyz' } }),
    ).toBe('https://g.page/r/abc/review')
  })

  test('builds a writereview URL from a placeId', () => {
    expect(buildGoogleReviewUrl({ newReviewUri: null, clinic: { placeId: 'ChIJxyz' } })).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJxyz',
    )
  })

  test('builds a cid URL when only gmapsUrl is available', () => {
    expect(
      buildGoogleReviewUrl({ newReviewUri: null, clinic: { placeId: null, gmapsUrl: 'https://maps.google.com/?cid=42' } }),
    ).toBe('https://www.google.com/maps?cid=42&reviews=1')
  })

  test('returns null with nothing to work from', () => {
    expect(buildGoogleReviewUrl({ newReviewUri: null, clinic: { placeId: null, gmapsUrl: null } })).toBeNull()
  })
})
