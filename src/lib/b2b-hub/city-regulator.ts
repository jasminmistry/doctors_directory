import { locations } from '@/lib/data'
import { P0_TREATMENT_CITY_HUB_CITIES } from '@/lib/treatment-hub-cities'
import { toUrlSlug } from '@/lib/utils'

const SCOTTISH_CITY_SLUGS = new Set([
  'aberdeen',
  'airdrie',
  'dumfries',
  'dundee',
  'dunfermline',
  'east-kilbride',
  'edinburgh',
  'falkirk',
  'glasgow',
  'greenock',
  'hamilton',
  'inverness',
  'kilmarnock',
  'kirkcaldy',
  'livingston',
  'paisley',
  'perth',
  'stirling',
])

const WELSH_CITY_SLUGS = new Set([
  'bangor',
  'cardiff',
  'newport',
  'swansea',
  'wrexham',
])

const NORTHERN_IRELAND_CITY_SLUGS = new Set(['belfast', 'derry', 'londonderry'])

export type UkRegulator = 'CQC' | 'HIS' | 'HIW' | 'RQIA'

export const getCityRegulator = (citySlug: string): UkRegulator => {
  const slug = citySlug.trim().toLowerCase()
  if (SCOTTISH_CITY_SLUGS.has(slug)) {
    return 'HIS'
  }
  if (WELSH_CITY_SLUGS.has(slug)) {
    return 'HIW'
  }
  if (NORTHERN_IRELAND_CITY_SLUGS.has(slug)) {
    return 'RQIA'
  }
  return 'CQC'
}

export const isScottishCity = (citySlug: string): boolean =>
  getCityRegulator(citySlug) === 'HIS'

export const regulatorLabel = (regulator: UkRegulator): string => {
  switch (regulator) {
    case 'HIS':
      return 'Healthcare Improvement Scotland (HIS)'
    case 'HIW':
      return 'Healthcare Inspectorate Wales (HIW)'
    case 'RQIA':
      return 'RQIA'
    default:
      return 'CQC'
  }
}

export const regulatorInspectionLine = (cityTitle: string, regulator: UkRegulator): string => {
  switch (regulator) {
    case 'HIS':
      return `HIS inspections are increasing across ${cityTitle}`
    case 'HIW':
      return `HIW inspections are increasing across ${cityTitle}`
    case 'RQIA':
      return `RQIA inspections are increasing across ${cityTitle}`
    default:
      return `CQC inspections are increasing across ${cityTitle}`
  }
}

export const regulatorComplianceLine = (regulator: UkRegulator): string => {
  switch (regulator) {
    case 'HIS':
      return 'Paper consent forms do not meet HIS evidence standards'
    case 'HIW':
      return 'Paper consent forms do not meet HIW evidence standards'
    case 'RQIA':
      return 'Paper consent forms do not meet RQIA evidence standards'
    default:
      return 'Paper consent forms do not meet CQC evidence standards'
  }
}

export const regulatorReadinessAuditLabel = (regulator: UkRegulator): string => {
  switch (regulator) {
    case 'HIS':
      return 'Get HIS Readiness Audit'
    case 'HIW':
      return 'Get HIW Readiness Audit'
    case 'RQIA':
      return 'Get RQIA Readiness Audit'
    default:
      return 'Get CQC Readiness Audit'
  }
}

export const nearbyCitySlugs: Record<string, string[]> = {
  london: ['reading', 'brighton', 'cambridge', 'oxford'],
  manchester: ['liverpool', 'leeds', 'sheffield', 'birmingham'],
  birmingham: ['coventry', 'leicester', 'nottingham', 'manchester'],
  glasgow: ['edinburgh', 'paisley', 'hamilton', 'stirling'],
  edinburgh: ['glasgow', 'livingston', 'dunfermline', 'stirling'],
  bristol: ['cardiff', 'bath', 'newport', 'reading'],
  leeds: ['manchester', 'sheffield', 'york', 'liverpool'],
  liverpool: ['manchester', 'chester', 'warrington', 'preston'],
  cardiff: ['bristol', 'newport', 'swansea', 'birmingham'],
  belfast: ['derry', 'dublin'],
}

export const getNearbyCitySlugs = (citySlug: string): string[] =>
  nearbyCitySlugs[citySlug.trim().toLowerCase()] ?? []

const locationLabelBySlug = new Map(locations.map((label) => [toUrlSlug(label), label]))

export type NearbyCityLink = {
  slug: string
  label: string
}

const nearbyLabelForSlug = (slug: string): string | null => {
  const label =
    locationLabelBySlug.get(slug) ??
    slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  return label || null
}

export const getNearbyCityLinks = (citySlug: string): NearbyCityLink[] => {
  const normalized = citySlug.trim().toLowerCase()
  const primary = getNearbyCitySlugs(normalized).flatMap((slug) => {
    const label = nearbyLabelForSlug(slug)
    return label ? [{ slug, label }] : []
  })
  if (primary.length > 0) {
    return primary
  }

  return P0_TREATMENT_CITY_HUB_CITIES.map((city) => ({
    slug: toUrlSlug(city),
    label: city,
  }))
    .filter((entry) => entry.slug !== normalized)
    .slice(0, 4)
}
