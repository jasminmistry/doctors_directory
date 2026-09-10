import { prisma } from '@/lib/db'
import type { GbpFieldsInput } from '@/lib/schemas/gbp.schema'
import { formatSingleLineAddress } from '@/lib/gbp/address'
import { periodsToDisplayMap, DAYS_OF_WEEK } from '@/lib/gbp/hours'
import { invalidateSearchCache } from '@/lib/search-cache'

/**
 * Writes the GBP-mirror fields for a clinic: structured address, hour periods (+ legacy
 * ClinicHour mirror), services, and the Clinic scalars (regenerating gmapsAddress /
 * category so search + the public profile stay correct). Shared by the portal PATCH
 * route and the pull-from-Google flow.
 */
export async function persistGbpFields(
  clinicId: number,
  data: GbpFieldsInput,
  opts: { source?: 'manual' | 'gbp' } = {},
): Promise<void> {
  const source = opts.source ?? 'manual'
  const addr = data.address ?? null
  const singleLine = addr
    ? formatSingleLineAddress({
        addressLines: addr.addressLines ?? null,
        locality: addr.locality ?? null,
        administrativeArea: addr.administrativeArea ?? null,
        postalCode: addr.postalCode ?? null,
        regionCode: addr.regionCode ?? null,
      })
    : null

  const hourPeriods = data.hourPeriods ?? []
  const displayMap = periodsToDisplayMap(hourPeriods)

  await prisma.$transaction(async (tx) => {
    if (addr) {
      const addrData = {
        regionCode: addr.regionCode ?? null,
        languageCode: addr.languageCode ?? null,
        postalCode: addr.postalCode ?? null,
        administrativeArea: addr.administrativeArea ?? null,
        locality: addr.locality ?? null,
        sublocality: addr.sublocality ?? null,
        addressLines: addr.addressLines ?? [],
        latitude: addr.latitude ?? null,
        longitude: addr.longitude ?? null,
        source,
      }
      await tx.clinicAddress.upsert({
        where: { clinicId },
        create: { clinicId, ...addrData },
        update: addrData,
      })
    }

    if (data.hourPeriods !== undefined) {
      await tx.clinicHourPeriod.deleteMany({ where: { clinicId } })
      if (hourPeriods.length) {
        await tx.clinicHourPeriod.createMany({
          data: hourPeriods.map((p, i) => ({ ...p, clinicId, sortOrder: i })),
        })
        for (const day of DAYS_OF_WEEK) {
          await tx.clinicHour.upsert({
            where: { clinicId_dayOfWeek: { clinicId, dayOfWeek: day } },
            create: { clinicId, dayOfWeek: day, hours: displayMap[day] },
            update: { hours: displayMap[day] },
          })
        }
      }
    }

    if (data.services !== undefined) {
      await tx.clinicService.deleteMany({ where: { clinicId } })
      if (data.services.length) {
        await tx.clinicService.createMany({
          data: data.services.map((s, i) => ({
            clinicId,
            name: s.name,
            description: s.description ?? null,
            priceUnits: s.priceUnits ?? null,
            currency: s.currency ?? 'GBP',
            categoryId: s.categoryId ?? null,
            isFreeForm: s.isFreeForm ?? true,
            sortOrder: i,
            source,
          })),
        })
      }
    }

    await tx.clinic.update({
      where: { id: clinicId },
      data: {
        ...(data.placeId !== undefined ? { placeId: data.placeId?.trim() || null } : {}),
        ...(data.gbpPrimaryPhone !== undefined ? { gbpPrimaryPhone: data.gbpPrimaryPhone ?? null } : {}),
        ...(data.additionalPhones !== undefined ? { additionalPhones: data.additionalPhones } : {}),
        ...(data.primaryCategory !== undefined
          ? {
              gbpPrimaryCategoryId: data.primaryCategory?.id ?? null,
              gbpPrimaryCategoryName: data.primaryCategory?.name ?? null,
              ...(data.primaryCategory?.name ? { category: data.primaryCategory.name.slice(0, 100) } : {}),
            }
          : {}),
        ...(data.additionalCategories !== undefined
          ? { gbpAdditionalCategories: data.additionalCategories }
          : {}),
        ...(data.serviceArea !== undefined ? { gbpServiceArea: data.serviceArea ?? undefined } : {}),
        ...(data.gbpBookingUrl !== undefined
          ? { gbpBookingUrl: (data.gbpBookingUrl as string | null) || null }
          : {}),
        ...(data.website !== undefined ? { website: (data.website as string | null) || null } : {}),
        ...(data.description !== undefined ? { aboutSection: data.description || null } : {}),
        ...(singleLine ? { gmapsAddress: singleLine } : {}),
        gbpFieldsUpdatedAt: new Date(),
      },
    })
  })

  await invalidateSearchCache()
}
