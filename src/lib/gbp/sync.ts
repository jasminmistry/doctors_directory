import { prisma } from '@/lib/db'
import { getClinicDisplayName } from '@/lib/clinic-display'
import { invalidateSearchCache } from '@/lib/search-cache'
import { GbpApiError, GbpReauthError } from '@/lib/gbp/client'
import { buildLocationPatches, applyLocationPatch, type ClinicSyncData } from '@/lib/gbp/business-info'
import { uploadPendingPhotos } from '@/lib/gbp/media'
import { syncBookingLink } from '@/lib/gbp/place-actions'
import type { HourPeriodInput } from '@/lib/gbp/hours'

export interface SyncResult {
  ok: boolean
  needsConfirm?: ('name' | 'address')[]
  fieldResults: Record<string, 'ok' | string>
  photos?: { uploaded: number; failed: number }
}

export async function syncClinicToGbp(
  clinicId: number,
  opts: { confirmNameAddress: boolean },
): Promise<SyncResult> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: {
      name: true,
      slug: true,
      gmapsUrl: true,
      website: true,
      aboutSection: true,
      gbpPrimaryPhone: true,
      additionalPhones: true,
      gbpPrimaryCategoryId: true,
      gbpAdditionalCategories: true,
      gbpServiceArea: true,
      gbpBookingUrl: true,
      address: true,
      hourPeriods: { orderBy: { sortOrder: 'asc' } },
      services: { orderBy: { sortOrder: 'asc' } },
      gbpConnection: true,
    },
  })

  const conn = clinic.gbpConnection
  if (!conn || conn.status !== 'connected' || !conn.locationName || !conn.locationV4Name) {
    throw new Error('No connected GBP location')
  }

  const hasNameOrAddress = !!clinic.name || !!clinic.address
  if (hasNameOrAddress && !opts.confirmNameAddress) {
    const needsConfirm: ('name' | 'address')[] = []
    if (clinic.name) needsConfirm.push('name')
    if (clinic.address) needsConfirm.push('address')
    return { ok: false, needsConfirm, fieldResults: {} }
  }

  const data: ClinicSyncData = {
    name: clinic.name || getClinicDisplayName({ slug: clinic.slug, url: clinic.gmapsUrl ?? undefined }),
    website: clinic.website,
    description: clinic.aboutSection,
    gbpPrimaryPhone: clinic.gbpPrimaryPhone,
    additionalPhones: Array.isArray(clinic.additionalPhones) ? (clinic.additionalPhones as string[]) : [],
    gbpPrimaryCategoryId: clinic.gbpPrimaryCategoryId,
    gbpAdditionalCategories: Array.isArray(clinic.gbpAdditionalCategories)
      ? (clinic.gbpAdditionalCategories as { id: string; name: string }[])
      : [],
    gbpServiceArea: clinic.gbpServiceArea ?? null,
    address: clinic.address
      ? {
          regionCode: clinic.address.regionCode,
          languageCode: clinic.address.languageCode,
          postalCode: clinic.address.postalCode,
          administrativeArea: clinic.address.administrativeArea,
          locality: clinic.address.locality,
          sublocality: clinic.address.sublocality,
          addressLines: Array.isArray(clinic.address.addressLines)
            ? (clinic.address.addressLines as string[])
            : [],
        }
      : null,
    hourPeriods: clinic.hourPeriods.map(
      (p): HourPeriodInput => ({
        openDay: p.openDay as HourPeriodInput['openDay'],
        openTime: p.openTime,
        closeDay: p.closeDay as HourPeriodInput['closeDay'],
        closeTime: p.closeTime,
        sortOrder: p.sortOrder,
      }),
    ),
    services: clinic.services.map((s) => ({
      name: s.name,
      description: s.description,
      isFreeForm: s.isFreeForm,
      categoryId: s.categoryId,
    })),
  }

  const groups = buildLocationPatches(data, { includeNameAddress: opts.confirmNameAddress })
  const fieldResults: Record<string, 'ok' | string> = {}

  for (const group of groups) {
    try {
      await applyLocationPatch(conn.id, conn.locationName, group)
      fieldResults[group.field] = 'ok'
    } catch (err) {
      if (err instanceof GbpReauthError) throw err
      fieldResults[group.field] =
        err instanceof GbpApiError ? `error (${err.status}): ${err.body.slice(0, 160)}` : 'error'
    }
  }

  // Booking link
  if (clinic.gbpBookingUrl) {
    try {
      await syncBookingLink(conn.id, conn.locationName, clinic.gbpBookingUrl)
      fieldResults['bookingLink'] = 'ok'
    } catch (err) {
      fieldResults['bookingLink'] =
        err instanceof GbpApiError ? `error (${err.status})` : 'error'
    }
  }

  // Photos
  let photos: SyncResult['photos']
  try {
    photos = await uploadPendingPhotos(conn.id, conn.locationV4Name, clinicId)
  } catch (err) {
    console.error('[gbp/sync] photo upload failed:', err)
  }

  const anyError = Object.values(fieldResults).some((v) => v !== 'ok')
  await prisma.gbpConnection.update({
    where: { id: conn.id },
    data: {
      lastSyncedAt: new Date(),
      lastSyncError: anyError ? 'Some fields failed to sync — see field status' : null,
      syncFieldState: fieldResults,
    },
  })
  await invalidateSearchCache()

  return { ok: !anyError, fieldResults, photos }
}
