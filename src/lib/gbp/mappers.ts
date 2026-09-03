// Maps a Google Business Profile location resource into the directory's field shape
// (the same shape gbpFieldsSchema accepts / PATCH /api/portal/gbp/fields persists).

type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

const DAY_FROM_GBP: Record<string, Day> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

interface GbpTimeOfDay {
  hours?: number
  minutes?: number
}
interface GbpPeriod {
  openDay: string
  openTime?: GbpTimeOfDay
  closeDay: string
  closeTime?: GbpTimeOfDay
}

export interface GbpLocation {
  name?: string
  title?: string
  storefrontAddress?: {
    regionCode?: string
    languageCode?: string
    postalCode?: string
    administrativeArea?: string
    locality?: string
    sublocality?: string
    addressLines?: string[]
  }
  phoneNumbers?: { primaryPhone?: string; additionalPhones?: string[] }
  categories?: {
    primaryCategory?: { name?: string; displayName?: string }
    additionalCategories?: { name?: string; displayName?: string }[]
  }
  regularHours?: { periods?: GbpPeriod[] }
  serviceItems?: Array<{
    freeFormServiceItem?: { label?: { displayName?: string; description?: string } }
    structuredServiceItem?: { serviceTypeId?: string; description?: string }
  }>
  serviceArea?: unknown
  websiteUri?: string
  profile?: { description?: string }
  metadata?: { placeId?: string; mapsUri?: string; newReviewUri?: string }
}

function fmtTime(t?: GbpTimeOfDay): string {
  const h = String(t?.hours ?? 0).padStart(2, '0')
  const m = String(t?.minutes ?? 0).padStart(2, '0')
  return `${h}:${m}`
}

export interface DirectoryFields {
  placeId: string | null
  website: string | null
  description: string | null
  gbpPrimaryPhone: string | null
  additionalPhones: string[]
  address: {
    addressLines: string[]
    locality: string | null
    administrativeArea: string | null
    sublocality: string | null
    postalCode: string | null
    regionCode: string | null
    languageCode: string | null
  } | null
  primaryCategory: { id: string; name: string } | null
  additionalCategories: { id: string; name: string }[]
  hourPeriods: { openDay: Day; openTime: string; closeDay: Day; closeTime: string }[]
  services: { name: string; description: string | null; isFreeForm: boolean }[]
  serviceArea: unknown
}

export function gbpLocationToDirectory(loc: GbpLocation): DirectoryFields {
  const addr = loc.storefrontAddress
  return {
    placeId: loc.metadata?.placeId ?? null,
    website: loc.websiteUri ?? null,
    description: loc.profile?.description ?? null,
    gbpPrimaryPhone: loc.phoneNumbers?.primaryPhone ?? null,
    additionalPhones: loc.phoneNumbers?.additionalPhones ?? [],
    address: addr
      ? {
          addressLines: addr.addressLines ?? [],
          locality: addr.locality ?? null,
          administrativeArea: addr.administrativeArea ?? null,
          sublocality: addr.sublocality ?? null,
          postalCode: addr.postalCode ?? null,
          regionCode: addr.regionCode ?? null,
          languageCode: addr.languageCode ?? null,
        }
      : null,
    primaryCategory: loc.categories?.primaryCategory?.name
      ? {
          id: loc.categories.primaryCategory.name,
          name: loc.categories.primaryCategory.displayName ?? loc.categories.primaryCategory.name,
        }
      : null,
    additionalCategories: (loc.categories?.additionalCategories ?? [])
      .filter((c) => c.name)
      .map((c) => ({ id: c.name as string, name: c.displayName ?? (c.name as string) })),
    hourPeriods: (loc.regularHours?.periods ?? [])
      .filter((p) => DAY_FROM_GBP[p.openDay] && DAY_FROM_GBP[p.closeDay])
      .map((p) => ({
        openDay: DAY_FROM_GBP[p.openDay],
        openTime: fmtTime(p.openTime),
        closeDay: DAY_FROM_GBP[p.closeDay],
        closeTime: fmtTime(p.closeTime),
      })),
    services: (loc.serviceItems ?? [])
      .map((s) => {
        if (s.freeFormServiceItem?.label?.displayName) {
          return {
            name: s.freeFormServiceItem.label.displayName,
            description: s.freeFormServiceItem.label.description ?? null,
            isFreeForm: true,
          }
        }
        if (s.structuredServiceItem?.serviceTypeId) {
          return {
            name: s.structuredServiceItem.serviceTypeId,
            description: s.structuredServiceItem.description ?? null,
            isFreeForm: false,
          }
        }
        return null
      })
      .filter((s): s is NonNullable<typeof s> => s !== null),
    serviceArea: loc.serviceArea ?? null,
  }
}

export interface FieldDiff {
  field: string
  current: unknown
  incoming: unknown
}

/** Shallow diff for the "Google has X, your listing has Y" import UI. */
export function diffFields(current: Partial<DirectoryFields>, incoming: DirectoryFields): FieldDiff[] {
  const keys: (keyof DirectoryFields)[] = [
    'placeId',
    'website',
    'description',
    'gbpPrimaryPhone',
    'additionalPhones',
    'address',
    'primaryCategory',
    'additionalCategories',
    'hourPeriods',
    'services',
  ]
  const out: FieldDiff[] = []
  for (const k of keys) {
    const a = JSON.stringify(current[k] ?? null)
    const b = JSON.stringify(incoming[k] ?? null)
    if (a !== b) out.push({ field: k, current: current[k] ?? null, incoming: incoming[k] ?? null })
  }
  return out
}
