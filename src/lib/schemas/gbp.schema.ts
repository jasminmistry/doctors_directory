import { z } from 'zod'

// Max lengths mirror the @db.VarChar column widths on the GBP-mirror models in
// prisma/schema.prisma — keep in sync so a bad value fails validation, not a Prisma 500.

const DAY = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])
const HHMM = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use 24-hour HH:MM')

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .max(1000)
  .optional()
  .or(z.literal(''))
  .nullable()

const category = z.object({
  id: z.string().max(100),
  name: z.string().max(255),
})

export const gbpFieldsSchema = z.object({
  placeId: z.string().trim().max(255).optional().nullable(),

  address: z
    .object({
      addressLines: z.array(z.string().max(255)).max(5).optional(),
      locality: z.string().max(120).optional().nullable(),
      administrativeArea: z.string().max(120).optional().nullable(),
      sublocality: z.string().max(120).optional().nullable(),
      postalCode: z.string().max(20).optional().nullable(),
      regionCode: z.string().max(2).optional().nullable(),
      languageCode: z.string().max(10).optional().nullable(),
      latitude: z.number().min(-90).max(90).optional().nullable(),
      longitude: z.number().min(-180).max(180).optional().nullable(),
    })
    .optional()
    .nullable(),

  gbpPrimaryPhone: z.string().max(50).optional().nullable(),
  additionalPhones: z.array(z.string().max(50)).max(5).optional(),

  primaryCategory: category.optional().nullable(),
  additionalCategories: z.array(category).max(9).optional(),

  hourPeriods: z
    .array(
      z.object({
        openDay: DAY,
        openTime: HHMM,
        closeDay: DAY,
        closeTime: HHMM,
      }),
    )
    .max(50)
    .optional(),

  services: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional().nullable(),
        priceUnits: z.number().int().min(0).optional().nullable(),
        currency: z.string().length(3).optional().nullable(),
        categoryId: z.string().max(100).optional().nullable(),
        isFreeForm: z.boolean().optional(),
      }),
    )
    .max(100)
    .optional(),

  serviceArea: z
    .object({
      businessType: z.string().optional(),
      places: z
        .object({
          placeInfos: z
            .array(z.object({ placeName: z.string(), placeId: z.string().optional() }))
            .max(20),
        })
        .optional(),
    })
    .optional()
    .nullable(),

  gbpBookingUrl: optionalUrl,
  website: optionalUrl,
  description: z.string().max(750).optional().nullable(),
})

export type GbpFieldsInput = z.infer<typeof gbpFieldsSchema>
