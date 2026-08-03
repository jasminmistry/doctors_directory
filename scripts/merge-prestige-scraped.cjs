const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
require('dotenv').config()

const ROOT = path.join(__dirname, '..')
const CLINICS_PATH = path.join(ROOT, 'public/clinics_processed_new_data.json')
const PRESTIGE_PATH = path.join(ROOT, 'src/lib/data/prestige-accreditations.json')
const SCRAPED_PATH = path.join(ROOT, 'coverage/toby-feedback-2026-07-13/scrape/scraped-clinics.json')
const TARGETS_PATH = path.join(ROOT, 'coverage/toby-feedback-2026-07-13/scrape/targets.json')
const REPORT_PATH = path.join(ROOT, 'coverage/toby-feedback-2026-07-13/scrape/merge-report.json')

const CITY_ALIASES = {
  'sutton coldfield': 'Sutton',
  'tunbridge wells': 'Tunbridge',
  godalming: 'London',
  'd24 fw22': 'London',
  '54000': 'London',
  lahore: 'London',
}

function toSlug(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown'
}

function cleanAddress(addr) {
  return String(addr || '')
    .replace(/[\uE000-\uF8FF]/g, '')
    .replace(/\n+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCity(raw, address) {
  const addr = String(address || '')
  if (/pakistan|lahore|india|dubai|usa|united states/i.test(addr)) return 'London'
  const key = String(raw || '')
    .toLowerCase()
    .trim()
  if (!key || /^\d+$/.test(key) || key.length < 2) return 'London'
  if (CITY_ALIASES[key]) return CITY_ALIASES[key]
  if (/london/i.test(addr)) return 'London'
  return String(raw)
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function awardsBadgeLabel(awards) {
  if (!Array.isArray(awards) || !awards.length) return null
  const rank = { Winner: 4, 'Highly Commended': 3, Commended: 2, Finalist: 1 }
  const sorted = [...awards].sort(
    (a, b) => b.year - a.year || (rank[b.result] || 0) - (rank[a.result] || 0)
  )
  const top = sorted[0]
  return `Aesthetics Awards ${top.result} ${top.year}`
}

function tatlerBadgeLabel(years) {
  if (!Array.isArray(years) || !years.length) return null
  const top = Math.max(...years.map(Number).filter(Boolean))
  return Number.isFinite(top) ? `Tatler Guide ${top}` : null
}

function namesRoughlyMatch(a, b) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  const na = norm(a)
  const nb = norm(b)
  if (!na || !nb) return false
  return na.includes(nb) || nb.includes(na) || na.slice(0, 8) === nb.slice(0, 8)
}

function buildClinicRow(scraped, target) {
  const displayName = target?.displayName || scraped.displayName || scraped.slug
  const mapsName = scraped.displayName
  const address = cleanAddress(scraped.clinic.gmapsAddress)
  const city = normalizeCity(scraped.clinic.City, address)
  const keepMapsUrl = namesRoughlyMatch(mapsName, displayName) || namesRoughlyMatch(scraped.clinic.url, displayName)
  const about =
    scraped.clinic.about_section && !/is a UK aesthetic/.test(scraped.clinic.about_section)
      ? scraped.clinic.about_section
      : `${displayName} is a UK aesthetic / medical clinic recognized in industry awards and guides.`

  return {
    slug: scraped.slug,
    name: displayName,
    image: scraped.clinic.image || '',
    url: keepMapsUrl ? scraped.clinic.url || '' : '',
    rating: scraped.clinic.rating || 0,
    reviewCount: scraped.clinic.reviewCount || 0,
    category: scraped.clinic.category || 'Aesthetic clinic',
    gmapsAddress: address || `${city}, United Kingdom`,
    gmapsPhone: scraped.clinic.gmapsPhone || '',
    reviewAnalysis: scraped.clinic.reviewAnalysis || {},
    weighted_analysis: scraped.clinic.weighted_analysis || {},
    City: city,
    x_twitter: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    Linkedin: '',
    website: scraped.clinic.website || target?.websiteHint || '',
    email: scraped.clinic.email || '',
    isSaveFace: false,
    isDoctor: false,
    isJCCP: null,
    isCQC: null,
    isHIW: null,
    isHIS: null,
    isRQIA: null,
    about_section: about,
    accreditations: '',
    hours: {},
    Practitioners: '',
    Insurace: [],
    Payments: [],
    Fees: [],
    Treatments: [],
    criteria_breakdown: {},
    advice: {},
    ranking: {},
  }
}

async function main() {
  const scraped = JSON.parse(fs.readFileSync(SCRAPED_PATH, 'utf8'))
  const targets = JSON.parse(fs.readFileSync(TARGETS_PATH, 'utf8'))
  const targetBySlug = Object.fromEntries(targets.map((t) => [t.slug, t]))
  const clinics = JSON.parse(fs.readFileSync(CLINICS_PATH, 'utf8'))
  const prestige = JSON.parse(fs.readFileSync(PRESTIGE_PATH, 'utf8'))
  const existing = new Set(clinics.map((c) => c.slug))

  const added = []
  const skippedExisting = []
  const prestigeAdded = []

  for (const row of scraped) {
    const target = targetBySlug[row.slug]
    if (existing.has(row.slug)) {
      skippedExisting.push(row.slug)
    } else {
      const clinic = buildClinicRow(row, target)
      clinics.push(clinic)
      existing.add(row.slug)
      added.push({ slug: clinic.slug, city: clinic.City, name: clinic.name })
    }

    const city =
      clinics.find((c) => c.slug === row.slug)?.City ||
      normalizeCity(row.clinic.City, row.clinic.gmapsAddress)
    const awards = target?.aestheticsAwards || row.aestheticsAwards || []
    const tatlerYears = target?.tatlerYears || row.tatlerYears || []
    if (!prestige[row.slug]) {
      prestige[row.slug] = {
        slug: row.slug,
        city,
        aestheticsAwards: awards,
        tatlerYears,
        awardsBadgeLabel: awardsBadgeLabel(awards),
        tatlerBadgeLabel: tatlerBadgeLabel(tatlerYears),
      }
      prestigeAdded.push(row.slug)
    }
  }

  fs.writeFileSync(CLINICS_PATH, JSON.stringify(clinics))
  fs.writeFileSync(PRESTIGE_PATH, JSON.stringify(prestige, null, 2) + '\n')

  const { hostname, port, username, password, pathname } = new URL(process.env.DATABASE_URL)
  const adapter = new PrismaMariaDb({
    host: hostname,
    port: parseInt(port || '3306', 10),
    user: username,
    password: decodeURIComponent(password),
    database: pathname.slice(1),
  })
  const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] })

  const cityCache = new Map()
  async function resolveCityId(cityName) {
    if (!cityName) return null
    if (cityCache.has(cityName)) return cityCache.get(cityName)
    const existingCity = await prisma.city.findFirst({ where: { name: cityName } })
    if (existingCity) {
      cityCache.set(cityName, existingCity.id)
      return existingCity.id
    }
    const created = await prisma.city.upsert({
      where: { slug: toSlug(cityName) },
      create: { slug: toSlug(cityName), name: cityName },
      update: { name: cityName },
    })
    cityCache.set(cityName, created.id)
    return created.id
  }

  let upserted = 0
  const dbErrors = []
  for (const item of added) {
    const clinic = clinics.find((c) => c.slug === item.slug)
    try {
      const cityId = await resolveCityId(clinic.City)
      await prisma.clinic.upsert({
        where: { slug: clinic.slug },
        create: {
          slug: clinic.slug,
          cityId,
          name: clinic.name,
          image: clinic.image || null,
          gmapsUrl: clinic.url || null,
          gmapsAddress: clinic.gmapsAddress || null,
          gmapsPhone: clinic.gmapsPhone || null,
          category: clinic.category || null,
          rating: clinic.rating || null,
          reviewCount: clinic.reviewCount || 0,
          aboutSection: clinic.about_section || null,
          website: clinic.website || null,
          email: clinic.email || null,
          claimed: false,
        },
        update: {
          cityId,
          name: clinic.name,
          image: clinic.image || null,
          gmapsUrl: clinic.url || null,
          gmapsAddress: clinic.gmapsAddress || null,
          gmapsPhone: clinic.gmapsPhone || null,
          category: clinic.category || null,
          rating: clinic.rating || null,
          reviewCount: clinic.reviewCount || 0,
          aboutSection: clinic.about_section || null,
          website: clinic.website || null,
          email: clinic.email || null,
        },
      })
      upserted += 1
    } catch (err) {
      dbErrors.push({ slug: clinic.slug, error: String(err.message || err) })
    }
  }

  await prisma.$disconnect()

  const report = {
    clinicsTotal: clinics.length,
    scraped: scraped.length,
    jsonAdded: added.length,
    skippedExisting: skippedExisting.length,
    prestigeAdded: prestigeAdded.length,
    prestigeTotal: Object.keys(prestige).length,
    dbUpserted: upserted,
    dbErrors,
    sampleUrls: added.slice(0, 12).map((a) => ({
      slug: a.slug,
      city: a.city,
      path: `/directory/clinics/${toSlug(a.city)}/clinic/${a.slug}`,
    })),
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
