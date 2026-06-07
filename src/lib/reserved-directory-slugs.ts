export const RESERVED_SLUG_CITY_FIRST_SEGMENTS = new Set([
  'admin',
  'api',
  'accredited',
  'alternatives',
  'automation',
  'business',
  'claim',
  'clinics',
  'compare',
  'consent',
  'cqc',
  'migrate',
  'portal',
  'practitioners',
  'pricing',
  'products',
  'register',
  'search',
  'templates',
  'treatments',
  'uk',
  'verify',
])

export const isReservedSlugCityFirstSegment = (slug: string): boolean =>
  RESERVED_SLUG_CITY_FIRST_SEGMENTS.has(slug.trim().toLowerCase())
