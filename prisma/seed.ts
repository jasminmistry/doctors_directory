import { PrismaClient, DayOfWeek } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const { hostname, port, username, password, pathname } = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: hostname,
  port: parseInt(port) || 3306,
  user: username,
  password: decodeURIComponent(password),
  database: pathname.slice(1),
})
const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] })
const DATA_DIR = path.join(__dirname, '../public')

// ============================================================
// Helpers
// ============================================================

function loadJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
}

/** Safely parse a value that might be a JSON string, an array, an object, or null */
function safeParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback
  if (typeof val !== 'string') return val as T
  try {
    return JSON.parse(val) as T
  } catch {
    return fallback
  }
}

function toSlug(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown'
}

/** Deduplicates slugs by appending -2, -3 … as needed */
function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base || 'unknown'
  let i = 2
  while (used.has(slug)) slug = `${base}-${i++}`
  used.add(slug)
  return slug
}

/** Convert a kebab-case slug to a title-cased display name, e.g. "dr-rose-keating" → "Dr Rose Keating" */
function slugToDisplayName(slug: string): string {
  return (slug ?? '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim()
}

/** Truncate to max chars, returning null for empty values */
function trunc(s: string | null | undefined, max: number): string | null {
  if (!s) return null
  return s.length > max ? s.slice(0, max) : s
}

// ============================================================
// Treatment field extraction helpers
// ============================================================

// Pattern-based key lookup — returns the raw value for the first matching key
function findField(obj: Record<string, unknown>, pattern: RegExp, exclude?: RegExp): unknown {
  const key = Object.keys(obj).find(k => pattern.test(k) && (!exclude || !exclude.test(k)))
  return key !== undefined ? obj[key] : null
}

// Description needs special handling: try "how does it work" keys first,
// then fall back to bare "What is/are X" keys that aren't other fields
function findDescription(obj: Record<string, unknown>): unknown {
  const withHow = Object.keys(obj).find(k => /what.is.*how.does|what.are.*how.does|how.they.work/i.test(k))
  if (withHow) return obj[withHow]
  const EXCLUDE = /goals|pros|cons|cost|look.for|choos|candidate|prepar|safety|how.long|duration|mild|during|recover|regulat|qualif|nice|mhra|fda|mainten/i
  const bare = Object.keys(obj).find(k => /^what.is|^what.are/i.test(k) && !EXCLUDE.test(k))
  return bare ? obj[bare] : null
}

// Extract the best text string from a description value (string or object)
function extractDescriptionText(val: unknown): string | null {
  if (!val) return null
  if (typeof val === 'string') return val
  if (typeof val === 'object' && !Array.isArray(val)) {
    const v = val as Record<string, unknown>
    const primary = v.description ?? v.summary ?? v.text ?? v.content
    if (typeof primary === 'string') return primary
    const parts = Object.values(v).filter((s): s is string => typeof s === 'string')
    return parts.length ? parts.join('\n\n') : null
  }
  return null
}

// Regex patterns for each of the 16 non-description semantic fields
const FIELD_PATTERNS: Record<string, RegExp> = {
  goals:             /^goals.of|what.are.the.goals/i,
  prosAndCons:       /pros.and.cons|pros_and_cons/i,
  cost:              /^cost.of|^cost.in|what.is.the.cost|cost.in.the.uk/i,
  choosingDoctor:    /look.for.*choos|what.*look.*choos|^choos/i,
  alternatives:      /^compar|compairs|compare.*with/i,
  goodCandidate:     /good.candidate/i,
  preparation:       /prepar/i,
  safetyAndPain:     /safety.consider|safety.and.pain|safety_consider/i,
  howLongResultsLast:/how.long.*result|duration.of.result/i,
  mildVsSevere:      /mild.v[se]|mild_vs|mild.versus/i,
  whatHappensDuring: /what.happens.during|what_happens_during|^during/i,
  recovery:          /recovery.process|recovery_process|recovery.*downtime|recovery.and.side/i,
  regulation:        /regulated.*uk|is.*regulated|regulated_in|^regulation.in/i,
  maintenance:       /require.maintenance|maintenance.session|maintenance.and.frequen|maintenance_and_frequen|maintenance.and.repeat/i,
  qualifications:    /qualifications/i,
  niceGuidelines:    /nice|mhra|fda/i,
}

/** Runs fn for each item, logs progress, never throws on individual failures */
async function processAll<T>(
  label: string,
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
) {
  let ok = 0
  let skip = 0
  for (let i = 0; i < items.length; i++) {
    try {
      await fn(items[i], i)
      ok++
    } catch (err: any) {
      skip++
      if (process.env.SEED_VERBOSE) {
        console.error(`  [skip] ${label}[${i}]: ${err?.message}`)
      }
    }
    if ((ok + skip) % 200 === 0 || i === items.length - 1) {
      process.stdout.write(`\r  ${label}: ${ok + skip}/${items.length} (${skip} skipped)  `)
    }
  }
  console.log(`\r  ✓ ${label}: ${ok} seeded, ${skip} skipped${' '.repeat(20)}`)
}

const DAY_MAP: Record<string, DayOfWeek> = {
  monday:    DayOfWeek.Monday,
  tuesday:   DayOfWeek.Tuesday,
  wednesday: DayOfWeek.Wednesday,
  thursday:  DayOfWeek.Thursday,
  friday:    DayOfWeek.Friday,
  saturday:  DayOfWeek.Saturday,
  sunday:    DayOfWeek.Sunday,
}

// ============================================================
// 1. CITIES
// ============================================================

async function seedCities(): Promise<Map<string, number>> {
  console.log('\n[1/6] Cities')
  const rows = loadJson<any[]>('city_data_processed.json')
  const usedSlugs = new Set<string>()
  const cityMap = new Map<string, number>() // city name → db id

  await processAll('cities', rows, async (city) => {
    const slug = uniqueSlug(toSlug(city.City), usedSlugs)

    const record = await prisma.city.upsert({
      where: { slug },
      create: {
        slug,
        name: city.City,
        populationEstimate:            city.city_overview_population_estimate               ?? null,
        lifestyleCharacteristics:      city.city_overview_lifestyle_characteristics         ?? null,
        medicalInfrastructurePresence: city.city_overview_medical_infrastructure_presence   ?? null,
        numClinics:                    Number(city.market_size_indicators_number_of_clinics)    || 0,
        reviewVolumeTotal:             Number(city.market_size_indicators_review_volume_total)  || 0,
        averageRatingCitywide:         city.market_size_indicators_average_rating_citywide ? parseFloat(city.market_size_indicators_average_rating_citywide) : null,
        estimatedMarketStrength:       city.market_size_indicators_estimated_private_aesthetic_market_strength ?? null,
        nhsPresence:                   city.competitor_landscape_nhs_presence               ?? null,
        primaryRegulator:              city.regulatory_environment_primary_regulator         ?? null,
        prescribingRequirements:       city.regulatory_environment_prescribing_requirements  ?? null,
        inspectionFramework:           city.regulatory_environment_inspection_framework      ?? null,
        privateInsuranceUsage:         city.insurance_and_financing_private_insurance_usage         ?? null,
        cosmeticFinanceAvailability:   city.insurance_and_financing_cosmetic_finance_availability    ?? null,
        teachingHospitalLinks:         city.referral_networks_teaching_hospital_links        ?? null,
        publicTransportProximity:      city.accessibility_factors_public_transport_proximity  ?? null,
        parkingAvailability:           city.accessibility_factors_parking_availability        ?? null,
        cityVsSuburbanDistribution:    city.accessibility_factors_city_centre_vs_suburban_distribution ?? null,
        tourismVolumeIndicator:        city.medical_tourism_potential_tourism_volume_indicator  ?? null,
        hotelDensityNearClinics:       city.medical_tourism_potential_hotel_density_near_clinics ?? null,
        airportProximity:              city.medical_tourism_potential_airport_proximity        ?? null,
        medicalTourismViability:       city.medical_tourism_potential_medical_tourism_viability ?? null,
        marketMaturityLevel:           city.beauty_spend_indicators_market_maturity_level      ?? null,
        specializations:    Array.isArray(city.Unique_Specializations)                               ? city.Unique_Specializations                               : [],
        peakBookingPeriods: Array.isArray(city.seasonality_and_local_trends_peak_booking_periods)    ? city.seasonality_and_local_trends_peak_booking_periods    : [],
        socialMediaTrends:  Array.isArray(city.social_media_trends_content_trends)                   ? city.social_media_trends_content_trends                   : [],
      },
      update: {},
    })

    cityMap.set(city.City, record.id)
  })

  return cityMap
}

// ============================================================
// 2. TREATMENTS
// ============================================================

async function seedTreatments(clinicsData: any[]): Promise<Map<string, number>> {
  console.log('\n[2/6] Treatments')
  const treatmentsJson = loadJson<Record<string, any>>('treatments.json')

  // Union of names from treatments.json and from every clinic's Treatments array
  const fromJson    = Object.keys(treatmentsJson)
  const fromClinics = [...new Set(clinicsData.flatMap((c) => c.Treatments ?? []))] as string[]
  const allNames    = [...new Set([...fromJson, ...fromClinics])].filter(Boolean)

  const treatmentMap = new Map<string, number>() // lowercase-name → db id

  await processAll('treatments', allNames, async (name) => {
    const slug = toSlug(name)
    if (!slug || slug === 'unknown') return

    // Try exact key match, then case-insensitive match
    const jsonEntry: Record<string, unknown> | undefined =
      treatmentsJson[name] ??
      treatmentsJson[Object.keys(treatmentsJson).find((k) => k.toLowerCase() === name.toLowerCase()) ?? '']

    // Extract all 17 semantic fields using pattern-based key lookup
    const rawDesc   = jsonEntry ? findDescription(jsonEntry) : null
    const content   = jsonEntry
      ? Object.fromEntries(
          Object.entries(FIELD_PATTERNS).map(([field, rx]) => [field, findField(jsonEntry, rx)])
        )
      : {}

    const record = await prisma.treatment.upsert({
      where: { slug },
      create: {
        slug,
        name,
        description:       extractDescriptionText(rawDesc),
        goals:             content.goals             ?? null,
        prosAndCons:       content.prosAndCons       ?? null,
        cost:              content.cost              ?? null,
        choosingDoctor:    content.choosingDoctor    ?? null,
        alternatives:      content.alternatives      ?? null,
        goodCandidate:     content.goodCandidate     ?? null,
        preparation:       content.preparation       ?? null,
        safetyAndPain:     content.safetyAndPain     ?? null,
        howLongResultsLast:content.howLongResultsLast ?? null,
        mildVsSevere:      content.mildVsSevere      ?? null,
        whatHappensDuring: content.whatHappensDuring ?? null,
        recovery:          content.recovery          ?? null,
        regulation:        content.regulation        ?? null,
        maintenance:       content.maintenance       ?? null,
        qualifications:    content.qualifications    ?? null,
        niceGuidelines:    content.niceGuidelines    ?? null,
      },
      update: {
        description:       extractDescriptionText(rawDesc),
        goals:             content.goals             ?? null,
        prosAndCons:       content.prosAndCons       ?? null,
        cost:              content.cost              ?? null,
        choosingDoctor:    content.choosingDoctor    ?? null,
        alternatives:      content.alternatives      ?? null,
        goodCandidate:     content.goodCandidate     ?? null,
        preparation:       content.preparation       ?? null,
        safetyAndPain:     content.safetyAndPain     ?? null,
        howLongResultsLast:content.howLongResultsLast ?? null,
        mildVsSevere:      content.mildVsSevere      ?? null,
        whatHappensDuring: content.whatHappensDuring ?? null,
        recovery:          content.recovery          ?? null,
        regulation:        content.regulation        ?? null,
        maintenance:       content.maintenance       ?? null,
        qualifications:    content.qualifications    ?? null,
        niceGuidelines:    content.niceGuidelines    ?? null,
      },
    })

    treatmentMap.set(name.toLowerCase(), record.id)
    treatmentMap.set(slug, record.id)
  })

  return treatmentMap
}

// ============================================================
// 3. CLINICS  (+ hours, fees, ranking, staff, treatments)
// ============================================================

async function seedClinics(
  cityMap:      Map<string, number>,
  treatmentMap: Map<string, number>,
): Promise<Map<string, number>> {
  console.log('\n[3/6] Clinics')
  const rows = loadJson<any[]>('clinics_processed_new_data.json')
  const usedSlugs = new Set<string>()
  const clinicMap = new Map<string, number>() // original slug → db id

  await processAll('clinics', rows, async (clinic) => {
    const originalSlug = clinic.slug || toSlug(clinic.gmapsAddress ?? '')
    const slug         = uniqueSlug(originalSlug, usedSlugs)
    const cityId       = cityMap.get(clinic.City) ?? null

    // Regulatory flags come as [boolean, string] tuples
    const parseFlag = (val: any): [boolean, string | null] => {
      if (Array.isArray(val)) return [Boolean(val[0]), val[1] || null]
      return [Boolean(val), null]
    }
    const [isJccp, jccpUrl] = parseFlag(clinic.isJCCP)
    const [isCqc,  cqcUrl]  = parseFlag(clinic.isCQC)
    const [isHiw,  hiwUrl]  = parseFlag(clinic.isHIW)
    const [isHis,  hisUrl]  = parseFlag(clinic.isHIS)
    const [isRqia, rqiaUrl] = parseFlag(clinic.isRQIA)

    const record = await prisma.clinic.upsert({
      where: { slug },
      create: {
        slug,
        cityId,
        name:         clinic.name         ?? null,
        image:        clinic.image        ?? null,
        gmapsUrl:     clinic.url          ?? null,
        gmapsAddress: clinic.gmapsAddress ?? null,
        gmapsPhone:   clinic.gmapsPhone   ?? null,
        category:     clinic.category     ?? null,
        rating:       clinic.rating       ?? null,
        reviewCount:  clinic.reviewCount  ?? 0,
        aboutSection:   clinic.about_section ?? null,
        accreditations: typeof clinic.accreditations === 'string'
          ? clinic.accreditations
          : JSON.stringify(clinic.accreditations ?? []),
        awards:       clinic.awards       ?? null,
        affiliations: clinic.affiliations ?? null,
        website:   clinic.website   || null,
        email:     clinic.email     || null,
        facebook:  clinic.facebook  || null,
        twitter:   clinic.twitter   || null,
        xTwitter:  clinic.x_twitter || null,
        instagram: clinic.instagram || null,
        youtube:   clinic.youtube   || null,
        linkedin:  clinic.Linkedin  || null,
        isSaveFace: Boolean(clinic.isSaveFace),
        isDoctor:   Boolean(clinic.isDoctor),
        isJccp, jccpUrl,
        isCqc,  cqcUrl,
        isHiw,  hiwUrl,
        isHis,  hisUrl,
        isRqia, rqiaUrl,
        insuranceInfo:    Array.isArray(clinic.Insurace) ? clinic.Insurace : [],
        paymentMethods:   Array.isArray(clinic.Payments) ? clinic.Payments : [],
        reviewAnalysis:   clinic.reviewAnalysis   ?? null,
        weightedAnalysis: clinic.weighted_analysis ?? null,
        criteriaBreakdown: clinic.criteria_breakdown ?? null,
        advice:            clinic.advice           ?? null,
      },
      update: {},
    })

    // Track both original and deduplicated slug so practitioners can find it
    clinicMap.set(originalSlug, record.id)
    if (slug !== originalSlug) clinicMap.set(slug, record.id)

    // ---- Opening Hours -----------------------------------
    if (clinic.hours && typeof clinic.hours === 'object' && !Array.isArray(clinic.hours)) {
      const hoursData = Object.entries(clinic.hours as Record<string, string>)
        .filter(([day]) => DAY_MAP[day.toLowerCase()])
        .map(([day, h]) => ({
          clinicId:  record.id,
          dayOfWeek: DAY_MAP[day.toLowerCase()],
          hours:     String(h),
        }))
      if (hoursData.length) {
        await prisma.clinicHour.deleteMany({ where: { clinicId: record.id } })
        await prisma.clinicHour.createMany({ data: hoursData, skipDuplicates: true })
      }
    }

    // ---- Fees -------------------------------------------
    if (Array.isArray(clinic.Fees) && clinic.Fees.length) {
      const feesData = (clinic.Fees as any[])
        .filter((f) => f && typeof f === 'object' && f.treatment)
        .map((f) => ({
          clinicId:      record.id,
          treatmentName: String(f.treatment),
          price:         f.price ? String(f.price) : null,
        }))
      if (feesData.length) {
        await prisma.clinicFee.deleteMany({ where: { clinicId: record.id } })
        await prisma.clinicFee.createMany({ data: feesData })
      }
    }

    // ---- Ranking ----------------------------------------
    if (clinic.ranking) {
      const r = clinic.ranking
      await prisma.clinicRanking.upsert({
        where:  { clinicId: record.id },
        create: { clinicId: record.id, cityRank: r.city_rank ?? null, cityTotal: r.city_total ?? null, scoreOutOf100: r.score_out_of_100 ?? null, subtitleText: r.subtitle_text || null },
        update: {                       cityRank: r.city_rank ?? null, cityTotal: r.city_total ?? null, scoreOutOf100: r.score_out_of_100 ?? null, subtitleText: r.subtitle_text || null },
      })
    }

    // ---- Inline Staff -----------------------------------
    const staffRaw = Array.isArray(clinic.Practitioners)
      ? clinic.Practitioners
      : safeParse<any[]>(clinic.Practitioners, [])

    if (Array.isArray(staffRaw) && staffRaw.length) {
      const staffData = staffRaw
        .filter((p) => p && typeof p === 'object')
        .map((p) => ({
          clinicId:    record.id,
          fullName:    trunc(p['Full Name'], 255),
          title:       trunc(p.Title, 300),
          specialty:   Array.isArray(p.Specialty) ? p.Specialty : (p.Specialty ? [p.Specialty] : []),
          linkedinUrl: trunc(p.LinkedInURL, 500),
          profileUrl:  Array.isArray(p.ProfileURL) ? p.ProfileURL : (p.ProfileURL ? [p.ProfileURL] : []),
        }))
      if (staffData.length) {
        await prisma.clinicStaff.deleteMany({ where: { clinicId: record.id } })
        await prisma.clinicStaff.createMany({ data: staffData })
      }
    }

    // ---- Treatments (many-to-many) ----------------------
    if (Array.isArray(clinic.Treatments) && clinic.Treatments.length) {
      const links = (clinic.Treatments as string[])
        .map((t) => treatmentMap.get(t.toLowerCase()) ?? treatmentMap.get(toSlug(t)))
        .filter((id): id is number => id !== undefined)

      const uniqueLinks = [...new Map(links.map((id) => [id, { clinicId: record.id, treatmentId: id }])).values()]
      if (uniqueLinks.length) {
        await prisma.clinicTreatment.deleteMany({ where: { clinicId: record.id } })
        await prisma.clinicTreatment.createMany({ data: uniqueLinks, skipDuplicates: true })
      }
    }
  })

  return clinicMap
}

// ============================================================
// 4. PRACTITIONERS  (+ ranking, clinic associations, treatments)
// ============================================================

async function seedPractitioners(
  clinicMap:    Map<string, number>,
  treatmentMap: Map<string, number>,
): Promise<void> {
  console.log('\n[4/6] Practitioners')
  const rows = loadJson<any[]>('derms_processed_new_5403.json')
  const usedSlugs = new Set<string>()

  await processAll('practitioners', rows, async (p) => {
    const originalSlug = p.practitioner_name || toSlug(p.Title ?? '')
    const slug         = uniqueSlug(originalSlug, usedSlugs)

    const qualifications = safeParse<string[]>(p.practitioner_qualifications, [])
    const roles          = safeParse<string[]>(p.practitioner_roles,          [])
    const awards         = safeParse<string[]>(p.practitioner_awards,         [])
    const media          = safeParse<string[]>(p.practitioner_media,          [])
    const experience     = safeParse<string[]>(p.practitioner_experience,     [])

    const record = await prisma.practitioner.upsert({
      where: { slug },
      create: {
        slug,
        displayName:     p.practitioner_name
          ? slugToDisplayName(p.practitioner_name)
          : (p.Title || null),
        title:           p.practitioner_title || p.Title || null,
        specialty:       p.practitioner_specialty || null,
        imageUrl:        p.practitioner_image_link  || null,
        qualifications:  Array.isArray(qualifications) ? qualifications : [],
        roles:           Array.isArray(roles)          ? roles          : [],
        awards:          Array.isArray(awards)         ? awards         : [],
        media:           Array.isArray(media)          ? media          : [],
        experience:      Array.isArray(experience)     ? experience     : [],
        weightedAnalysis: p.weighted_analysis ?? null,
      },
      update: {},
    })

    // ---- Ranking ----------------------------------------
    if (p.ranking) {
      const r = p.ranking
      await prisma.practitionerRanking.upsert({
        where:  { practitionerId: record.id },
        create: { practitionerId: record.id, cityRank: r.city_rank ?? null, cityTotal: r.city_total ?? null, scoreOutOf100: r.score_out_of_100 ?? null, subtitleText: r.subtitle_text || null },
        update: {                             cityRank: r.city_rank ?? null, cityTotal: r.city_total ?? null, scoreOutOf100: r.score_out_of_100 ?? null, subtitleText: r.subtitle_text || null },
      })
    }

    // ---- Clinic Associations ----------------------------
    const associatedClinics = safeParse<string[]>(p.Associated_Clinics, [])
    if (Array.isArray(associatedClinics) && associatedClinics.length) {
      const links = associatedClinics
        .map((clinicSlug) => clinicMap.get(clinicSlug))
        .filter((id): id is number => id !== undefined)

      const uniqueLinks = [...new Map(links.map((id) => [id, { practitionerId: record.id, clinicId: id }])).values()]
      if (uniqueLinks.length) {
        await prisma.practitionerClinicAssociation.deleteMany({ where: { practitionerId: record.id } })
        await prisma.practitionerClinicAssociation.createMany({ data: uniqueLinks, skipDuplicates: true })
      }
    }

    // ---- Treatments -------------------------------------
    const treatments = Array.isArray(p.Treatments) ? p.Treatments as string[] : []
    if (treatments.length) {
      const links = treatments
        .map((t) => treatmentMap.get(t.toLowerCase()) ?? treatmentMap.get(toSlug(t)))
        .filter((id): id is number => id !== undefined)

      const uniqueLinks = [...new Map(links.map((id) => [id, { practitionerId: record.id, treatmentId: id }])).values()]
      if (uniqueLinks.length) {
        await prisma.practitionerTreatment.deleteMany({ where: { practitionerId: record.id } })
        await prisma.practitionerTreatment.createMany({ data: uniqueLinks, skipDuplicates: true })
      }
    }
  })
}

// ============================================================
// 5. PRODUCTS
// ============================================================

async function seedProducts(): Promise<void> {
  console.log('\n[5/6] Products')
  const rows       = loadJson<any[]>('products_processed_new.json')
  const usedSlugs  = new Set<string>()

  await processAll('products', rows, async (prod) => {
    const baseSlug = prod.slug || toSlug(prod.product_name ?? '')
    const slug     = uniqueSlug(baseSlug, usedSlugs)
    if (!slug || slug === 'unknown') return

    await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        productName:        prod.product_name        || 'Unknown',
        productCategory:    prod.product_category    || null,
        productSubcategory: prod.product_subcategory || null,
        category:           prod.category            || null,
        brand:              prod.brand               || null,
        manufacturer:       prod.manufacturer        || null,
        distributor:        prod.distributor         || null,
        distributorCleaned: prod.distributor_cleaned || null,
        sku:                prod.sku                 || null,
        imageUrl:           prod.image_url           || null,
        documentPdfUrl:     prod.product_document_pdf_from_manufacturer || null,
        description:        prod.description         || null,
        treatmentDuration:  prod.treatment_duration  || null,
        onsetOfEffect:      prod.onset_of_effect     || null,
        mhraApproved:       prod.mhra_approved       || null,
        ceMarked:           prod.ce_marked           || null,
        mhraLink:           prod.mhra_link           || null,
        brandAbout:         prod.brand_about         || null,
        sellerAbout:        prod.seller_about        || null,
        sourceVerifiedOn:   prod.source_verified_on  ? new Date(prod.source_verified_on) : null,
        dataConfidenceScore: prod.data_confidence_score ?? null,
        isAestheticsDermatologyRelated: prod.is_aesthetics_dermatology_related ?? null,
        keyBenefits:        safeParse(prod.key_benefits,                 []),
        indications:        safeParse(prod.indications,                  []),
        composition:        safeParse(prod.composition,                  []),
        formulation:        safeParse(prod.formulation,                  []),
        packaging:          safeParse(prod.packaging,                    []),
        usageInstructions:  safeParse(prod.usage_instructions,           []),
        contraindications:  safeParse(prod.contraindications,            []),
        adverseEffects:     safeParse(prod.adverse_effects,              []),
        storageConditions:  safeParse(prod.storage_conditions,           []),
        certifications:     safeParse(prod.certifications_and_compliance,[]),
        verificationSources: safeParse(prod.verification_sources,        []),
        allPrices:           prod.all_prices ?? null,
      },
      update: {},
    })
  })
}

// ============================================================
// 6. ACCREDITATION BODIES
// ============================================================

async function seedAccreditationBodies(): Promise<void> {
  console.log('\n[6/6] Accreditation Bodies')
  const rows = loadJson<any[]>('accreditations_processed_new.json')

  await processAll('accreditation_bodies', rows, async (acc) => {
    if (!acc.slug) return

    await prisma.accreditationBody.upsert({
      where: { slug: acc.slug },
      create: {
        slug:                acc.slug,
        image:               acc.image || null,
        overviewDescription: acc.overview?.description  || null,
        foundedYear:         acc.overview?.founded_year || null,
        founder:             acc.overview?.founder      || null,
        purpose:             acc.overview?.purpose      || null,
        governingOrgName:    acc.governing_body?.organisation_name  || null,
        companyStatus:       acc.governing_body?.company_status     || null,
        regulatoryStatus:    acc.governing_body?.regulatory_status  || null,
        industryStanding:    acc.governing_body?.industry_standing  || null,
        eligibilityWhoCanApply: acc.eligibility_criteria?.who_can_apply || null,
        inspectionRequired:     acc.accreditation_requirements?.inspection_required || null,
        publicRegister:              acc.verification_process?.public_register              || null,
        certificateValidationMethod: acc.verification_process?.certificate_validation_method || null,
        renewalFrequency: acc.renewal_and_compliance?.renewal_frequency || null,
        cpdRequirements:  acc.renewal_and_compliance?.cpd_requirements  || null,
        auditProcess:     acc.renewal_and_compliance?.audit_process     || null,
        reputation:         acc.benefits?.reputation           || null,
        patientTrustImpact: acc.benefits?.patient_trust_impact || null,
        statutoryBacking: acc.government_regulation_status?.statutory_backing || null,
        regulatedBy:      acc.government_regulation_status?.regulated_by      || null,
        legalStatus:      acc.government_regulation_status?.legal_status      || null,
        eligibilityRequirements: acc.eligibility_criteria?.requirements                   ?? [],
        eligibilityRestrictions: acc.eligibility_criteria?.restrictions                   ?? [],
        evaluationFactors:       acc.judging_criteria?.evaluation_factors                  ?? [],
        availableCategories:     acc.categories?.available_categories                      ?? [],
        documentationRequired:   acc.accreditation_requirements?.documentation_required    ?? [],
        complianceStandards:     acc.accreditation_requirements?.compliance_standards       ?? [],
        protectionMechanisms:    acc.patient_safety_impact?.mechanisms_of_protection       ?? [],
        limitations:             acc.patient_safety_impact?.limitations                    ?? [],
        comparableEntities:      acc.comparison_with_other_bodies?.comparable_entities     ?? [],
        keyDifferences:          acc.comparison_with_other_bodies?.key_differences         ?? [],
        mediaMentions:           acc.industry_recognition?.media_mentions                  ?? [],
        endorsements:            acc.industry_recognition?.endorsements                    ?? [],
        credibilitySignals:      acc.industry_recognition?.credibility_signals             ?? [],
        faqs:                    Array.isArray(acc.faqs) ? acc.faqs                        : [],
      },
      update: {},
    })
  })
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Doctors Directory — Database Seeder    ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log('\nTip: set SEED_VERBOSE=1 to see skipped-record details\n')

  const t0 = Date.now()

  // Load clinics early — treatments seeder needs them for the full union
  const clinicsData = loadJson<any[]>('clinics_processed_new_data.json')

  const cityMap      = await seedCities()
  const treatmentMap = await seedTreatments(clinicsData)
  const clinicMap    = await seedClinics(cityMap, treatmentMap)
  await seedPractitioners(clinicMap, treatmentMap)
  await seedProducts()
  await seedAccreditationBodies()

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\n✅  Seeding complete in ${elapsed}s`)
}

main()
  .catch((err) => { console.error('\n❌  Seeder failed:', err); process.exit(1) })
  .finally(() => prisma.$disconnect())
