import { prisma } from '@/lib/db'
import { gbpFetch } from '@/lib/gbp/client'
import { GBP_BUSINESS_INFO_BASE } from '@/lib/gbp/config'
import { gbpLocationToDirectory, diffFields, type GbpLocation, type DirectoryFields } from '@/lib/gbp/mappers'
import { persistGbpFields } from '@/lib/gbp/persist-fields'
import type { GbpFieldsInput } from '@/lib/schemas/gbp.schema'

const LOCATION_READ_MASK = [
  'name',
  'title',
  'storefrontAddress',
  'phoneNumbers',
  'categories',
  'regularHours',
  'serviceArea',
  'serviceItems',
  'websiteUri',
  'profile',
  'metadata',
].join(',')

export async function fetchGbpLocation(connectionId: number, locationName: string): Promise<GbpLocation> {
  const url = `${GBP_BUSINESS_INFO_BASE}/${locationName}?readMask=${encodeURIComponent(LOCATION_READ_MASK)}`
  return (await gbpFetch(connectionId, url)) as GbpLocation
}

/** Converts mapped Google fields into the PATCH payload shape, filling only empty
 * directory fields unless `overwrite` is set. */
export function buildPullPayload(
  incoming: DirectoryFields,
  current: {
    placeId: string | null
    website: string | null
    aboutSection: string | null
    gbpPrimaryPhone: string | null
    additionalPhones: unknown
    gbpPrimaryCategoryId: string | null
    hourPeriodCount: number
    serviceCount: number
    hasAddress: boolean
  },
  overwrite: boolean,
): GbpFieldsInput {
  const take = <T>(cur: T | null | undefined, next: T | null): T | undefined => {
    if (overwrite) return next ?? undefined
    return cur === null || cur === undefined || cur === '' ? (next ?? undefined) : undefined
  }

  const payload: GbpFieldsInput = {}

  const placeId = take(current.placeId, incoming.placeId)
  if (placeId !== undefined) payload.placeId = placeId

  const website = take(current.website, incoming.website)
  if (website !== undefined) payload.website = website

  const description = take(current.aboutSection, incoming.description)
  if (description !== undefined) payload.description = description

  const phone = take(current.gbpPrimaryPhone, incoming.gbpPrimaryPhone)
  if (phone !== undefined) payload.gbpPrimaryPhone = phone

  const curPhones = Array.isArray(current.additionalPhones) ? current.additionalPhones : []
  if (overwrite || curPhones.length === 0) payload.additionalPhones = incoming.additionalPhones

  if (overwrite || !current.hasAddress) {
    payload.address = incoming.address ?? null
  }

  if ((overwrite || !current.gbpPrimaryCategoryId) && incoming.primaryCategory) {
    payload.primaryCategory = incoming.primaryCategory
    payload.additionalCategories = incoming.additionalCategories
  }

  if (overwrite || current.hourPeriodCount === 0) {
    payload.hourPeriods = incoming.hourPeriods
  }

  if (overwrite || current.serviceCount === 0) {
    payload.services = incoming.services.map((s) => ({
      name: s.name,
      description: s.description,
      isFreeForm: s.isFreeForm,
    }))
  }

  if (incoming.serviceArea && (overwrite || true)) {
    payload.serviceArea = incoming.serviceArea as GbpFieldsInput['serviceArea']
  }

  return payload
}

export async function pullFromGbp(
  clinicId: number,
  opts: { apply: boolean; overwrite: boolean },
): Promise<{ diff: ReturnType<typeof diffFields>; applied: boolean }> {
  const conn = await prisma.gbpConnection.findUnique({ where: { clinicId } })
  if (!conn?.locationName) throw new Error('No bound GBP location')

  const location = await fetchGbpLocation(conn.id, conn.locationName)
  const incoming = gbpLocationToDirectory(location)

  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: {
      placeId: true,
      website: true,
      aboutSection: true,
      gbpPrimaryPhone: true,
      additionalPhones: true,
      gbpPrimaryCategoryId: true,
      gbpPrimaryCategoryName: true,
      address: true,
      _count: { select: { hourPeriods: true, services: true } },
    },
  })

  const currentForDiff = {
    placeId: clinic.placeId,
    website: clinic.website,
    description: clinic.aboutSection,
    gbpPrimaryPhone: clinic.gbpPrimaryPhone,
    additionalPhones: Array.isArray(clinic.additionalPhones)
      ? (clinic.additionalPhones.filter((p): p is string => typeof p === 'string'))
      : [],
    primaryCategory: clinic.gbpPrimaryCategoryId
      ? { id: clinic.gbpPrimaryCategoryId, name: clinic.gbpPrimaryCategoryName ?? '' }
      : null,
  }
  const diff = diffFields(currentForDiff, incoming)

  let applied = false
  if (opts.apply) {
    const payload = buildPullPayload(
      incoming,
      {
        placeId: clinic.placeId,
        website: clinic.website,
        aboutSection: clinic.aboutSection,
        gbpPrimaryPhone: clinic.gbpPrimaryPhone,
        additionalPhones: clinic.additionalPhones,
        gbpPrimaryCategoryId: clinic.gbpPrimaryCategoryId,
        hourPeriodCount: clinic._count.hourPeriods,
        serviceCount: clinic._count.services,
        hasAddress: !!clinic.address,
      },
      opts.overwrite,
    )
    await persistGbpFields(clinicId, payload, { source: 'gbp' })
    applied = true
  }

  await prisma.gbpConnection.update({ where: { id: conn.id }, data: { lastPulledAt: new Date() } })
  return { diff, applied }
}
