import { gbpFetch } from '@/lib/gbp/client'
import { GBP_BUSINESS_INFO_BASE } from '@/lib/gbp/config'
import { periodToGbp, type HourPeriodInput } from '@/lib/gbp/hours'

// Builds Business Information API `locations.patch` calls, split by concern so one bad
// field (e.g. an invalid category) doesn't abort the rest.

export interface ClinicSyncData {
  name: string | null
  website: string | null
  description: string | null
  gbpPrimaryPhone: string | null
  additionalPhones: string[]
  gbpPrimaryCategoryId: string | null
  gbpAdditionalCategories: { id: string; name: string }[]
  gbpServiceArea: unknown
  address: {
    regionCode: string | null
    languageCode: string | null
    postalCode: string | null
    administrativeArea: string | null
    locality: string | null
    sublocality: string | null
    addressLines: string[]
  } | null
  hourPeriods: HourPeriodInput[]
  services: { name: string; description: string | null; isFreeForm: boolean; categoryId: string | null }[]
}

export interface PatchGroup {
  field: string
  updateMask: string
  body: Record<string, unknown>
  /** name/address edits can push the location into re-verification */
  risky?: boolean
}

export function buildLocationPatches(
  data: ClinicSyncData,
  opts: { includeNameAddress: boolean },
): PatchGroup[] {
  const groups: PatchGroup[] = []

  if (opts.includeNameAddress && data.name) {
    groups.push({ field: 'name', updateMask: 'title', body: { title: data.name }, risky: true })
  }

  if (opts.includeNameAddress && data.address) {
    groups.push({
      field: 'address',
      updateMask: 'storefrontAddress',
      risky: true,
      body: {
        storefrontAddress: {
          regionCode: data.address.regionCode ?? 'GB',
          languageCode: data.address.languageCode ?? 'en',
          postalCode: data.address.postalCode ?? undefined,
          administrativeArea: data.address.administrativeArea ?? undefined,
          locality: data.address.locality ?? undefined,
          sublocality: data.address.sublocality ?? undefined,
          addressLines: data.address.addressLines.filter(Boolean),
        },
      },
    })
  }

  if (data.gbpPrimaryPhone) {
    groups.push({
      field: 'phones',
      updateMask: 'phoneNumbers',
      body: {
        phoneNumbers: {
          primaryPhone: data.gbpPrimaryPhone,
          additionalPhones: data.additionalPhones.filter(Boolean),
        },
      },
    })
  }

  if (data.gbpPrimaryCategoryId) {
    groups.push({
      field: 'categories',
      updateMask: 'categories',
      body: {
        categories: {
          primaryCategory: { name: data.gbpPrimaryCategoryId },
          additionalCategories: data.gbpAdditionalCategories
            .filter((c) => c.id)
            .map((c) => ({ name: c.id })),
        },
      },
    })
  }

  if (data.hourPeriods.length) {
    groups.push({
      field: 'hours',
      updateMask: 'regularHours',
      body: { regularHours: { periods: data.hourPeriods.map(periodToGbp) } },
    })
  }

  if (data.gbpServiceArea) {
    groups.push({ field: 'serviceArea', updateMask: 'serviceArea', body: { serviceArea: data.gbpServiceArea } })
  }

  if (data.services.length) {
    groups.push({
      field: 'services',
      updateMask: 'serviceItems',
      body: {
        serviceItems: data.services.map((s) =>
          s.isFreeForm || !s.categoryId
            ? { freeFormServiceItem: { label: { displayName: s.name, ...(s.description ? { description: s.description } : {}) } } }
            : {
                structuredServiceItem: {
                  serviceTypeId: s.categoryId,
                  ...(s.description ? { description: s.description } : {}),
                },
              },
        ),
      },
    })
  }

  const profileMask: string[] = []
  const profileBody: Record<string, unknown> = {}
  if (data.website) {
    profileMask.push('websiteUri')
    profileBody.websiteUri = data.website
  }
  if (data.description) {
    profileMask.push('profile.description')
    profileBody.profile = { description: data.description.slice(0, 750) }
  }
  if (profileMask.length) {
    groups.push({ field: 'profile', updateMask: profileMask.join(','), body: profileBody })
  }

  return groups
}

export async function applyLocationPatch(
  connectionId: number,
  locationName: string,
  group: PatchGroup,
): Promise<void> {
  const url = `${GBP_BUSINESS_INFO_BASE}/${locationName}?updateMask=${encodeURIComponent(group.updateMask)}`
  await gbpFetch(connectionId, url, { method: 'PATCH', body: JSON.stringify(group.body) })
}
