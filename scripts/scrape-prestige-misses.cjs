const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const ROOT = path.join(__dirname, '..')
const TARGETS_PATH = path.join(ROOT, 'coverage/toby-feedback-2026-07-13/scrape/targets.json')
const OUT_PATH = path.join(ROOT, 'coverage/toby-feedback-2026-07-13/scrape/scraped-clinics.json')
const PROGRESS_PATH = path.join(ROOT, 'coverage/toby-feedback-2026-07-13/scrape/progress.json')

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function pickCityFromAddress(address) {
  if (!address) return 'London'
  const parts = address.split(',').map((p) => p.trim())
  const ukIdx = parts.findIndex((p) => /united kingdom|uk|england|scotland|wales|northern ireland/i.test(p))
  const before = ukIdx > 0 ? parts[ukIdx - 1] : parts[parts.length - 2] || parts[0]
  const cleaned = String(before || 'London').replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi, '').trim()
  if (!cleaned) return 'London'
  if (/london/i.test(address)) return 'London'
  return cleaned.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout:${label}`)), ms)),
  ])
}

async function scrapeWebsite(page, website) {
  const result = { about: '', image: '', email: '', phone: '' }
  if (!website) return result
  try {
    await page.goto(website, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(800)
    const data = await page.evaluate(() => {
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''
      const desc =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        ''
      const bodyText = (document.body?.innerText || '').slice(0, 8000)
      const emailMatch = bodyText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
      const phoneMatch = bodyText.match(/(\+44\s?\d[\d\s()-]{8,}|\b0\d[\d\s()-]{8,})/)
      return {
        ogImage,
        desc: desc.slice(0, 600),
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0] || '',
      }
    })
    result.about = data.desc
    result.image = data.ogImage
    result.email = data.email
    result.phone = data.phone
  } catch {
  }
  return result
}

async function scrapeMaps(page, query) {
  const result = {
    name: '',
    address: '',
    phone: '',
    website: '',
    rating: 0,
    reviewCount: 0,
    image: '',
    mapsUrl: page.url(),
    category: 'Aesthetic clinic',
  }
  try {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 })
    await page.waitForTimeout(1800)

    const consent = page.locator('button:has-text("Accept all"), button:has-text("Reject all"), button:has-text("I agree")')
    if (await consent.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await consent.first().click().catch(() => {})
      await page.waitForTimeout(1000)
    }

    const firstResult = page.locator('a[href*="/maps/place/"]').first()
    if (await firstResult.isVisible({ timeout: 4000 }).catch(() => false)) {
      await firstResult.click({ timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(1800)
    }

    result.mapsUrl = page.url()

    const h1 = page.locator('h1').first()
    if (await h1.isVisible({ timeout: 2000 }).catch(() => false)) {
      result.name = (await h1.innerText({ timeout: 3000 })).trim()
    }

    const data = await page.evaluate(() => {
      const text = (document.body?.innerText || '').slice(0, 12000)
      const phone = (text.match(/(\+44\s?\d[\d\s()-]{8,}|\b0\d[\d\s()-]{8,})/) || [])[0] || ''
      const websiteAnchor = [...document.querySelectorAll('a')].find((a) => {
        const href = a.getAttribute('href') || ''
        const label = (a.getAttribute('aria-label') || a.textContent || '').toLowerCase()
        return (
          /^https?:\/\//.test(href) &&
          !/google\./i.test(href) &&
          /website|official site|site web/i.test(label)
        )
      })
      const website = websiteAnchor?.href || ''
      const imgs = [...document.querySelectorAll('img')]
        .map((img) => img.src)
        .filter((s) => /googleusercontent|ggpht|streetviewpixels/i.test(s))
      const ratingMatch = text.match(/(\d(?:\.\d)?)\s*\((\d[\d,]*)\)/)
      return {
        phone,
        website,
        image: imgs[0] || '',
        rating: ratingMatch ? Number(ratingMatch[1]) : 0,
        reviewCount: ratingMatch ? Number(ratingMatch[2].replace(/,/g, '')) : 0,
      }
    })

    Object.assign(result, data)

    const addressBtn = page.locator('button[data-item-id="address"], button[aria-label*="Address"]').first()
    if (await addressBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      const aria = await addressBtn.getAttribute('aria-label')
      result.address = (aria || '').replace(/^Address:\s*/i, '').trim()
    }
    if (!result.address) {
      const maybe = await page.locator('[data-item-id="address"]').first().innerText({ timeout: 1500 }).catch(() => '')
      result.address = maybe.trim()
    }
  } catch (err) {
    result.error = String(err.message || err)
  }
  return result
}

function buildClinicRecord(target, maps, site) {
  const name = maps.name || target.displayName
  const website = maps.website || target.websiteHint || site.website || ''
  const image = maps.image || site.image || ''
  const phone = maps.phone || site.phone || ''
  const address = maps.address || ''
  const city = pickCityFromAddress(address)
  const about = site.about || `${name} is a UK aesthetic / medical clinic recognized in industry awards and guides.`

  return {
    slug: target.slug,
    displayName: name,
    source: target.source,
    aestheticsAwards: target.aestheticsAwards || [],
    tatlerYears: target.tatlerYears || [],
    clinic: {
      slug: target.slug,
      image,
      url: maps.mapsUrl || '',
      rating: maps.rating || 0,
      reviewCount: maps.reviewCount || 0,
      category: maps.category || 'Aesthetic clinic',
      gmapsAddress: address || `${city}, United Kingdom`,
      gmapsPhone: phone,
      reviewAnalysis: {},
      weighted_analysis: {},
      City: city,
      x_twitter: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      Linkedin: '',
      website,
      email: site.email || '',
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
    },
  }
}

async function main() {
  const targets = loadJson(TARGETS_PATH, [])
  const scraped = loadJson(OUT_PATH, [])
  const done = new Set(scraped.map((s) => s.slug))
  const progress = loadJson(PROGRESS_PATH, { ok: 0, fail: 0, skipped: 0 })

  const limit = Number(process.env.SCRAPE_LIMIT || 0)
  const remaining = targets.filter((t) => !done.has(t.slug))
  const batch = limit > 0 ? remaining.slice(0, limit) : remaining

  console.log(`targets=${targets.length} done=${done.size} remaining=${remaining.length} batch=${batch.length}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    locale: 'en-GB',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  })
  context.setDefaultTimeout(12000)
  context.setDefaultNavigationTimeout(25000)
  let page = await context.newPage()

  for (let i = 0; i < batch.length; i++) {
    const target = batch[i]
    const query = target.websiteHint
      ? `${target.displayName} ${target.websiteHint} UK`
      : `${target.displayName} aesthetic clinic UK`
    console.log(`[${i + 1}/${batch.length}] ${target.slug} :: ${query}`)
    try {
      const maps = await withTimeout(scrapeMaps(page, query), 55000, 'maps')
      const website = maps.website || target.websiteHint
      const sitePage = await context.newPage()
      const site = await withTimeout(scrapeWebsite(sitePage, website), 20000, 'website').catch(() => ({
        about: '',
        image: '',
        email: '',
        phone: '',
      }))
      await sitePage.close().catch(() => {})
      const record = buildClinicRecord(target, maps, site)
      scraped.push(record)
      done.add(target.slug)
      progress.ok += 1
      saveJson(OUT_PATH, scraped)
      saveJson(PROGRESS_PATH, progress)
      console.log(`  ok city=${record.clinic.City} image=${!!record.clinic.image} web=${record.clinic.website}`)
    } catch (err) {
      const stub = buildClinicRecord(
        target,
        {
          name: target.displayName,
          address: '',
          phone: '',
          website: target.websiteHint || '',
          rating: 0,
          reviewCount: 0,
          image: '',
          mapsUrl: '',
          category: 'Aesthetic clinic',
        },
        { about: '', image: '', email: '', phone: '' }
      )
      stub.scrapeError = String(err.message || err)
      scraped.push(stub)
      done.add(target.slug)
      progress.fail += 1
      saveJson(OUT_PATH, scraped)
      saveJson(PROGRESS_PATH, { ...progress, lastError: String(err.message || err), lastSlug: target.slug })
      console.log(`  FAIL ${err.message || err} (stub saved)`)
      await page.close().catch(() => {})
      page = await context.newPage()
    }
    await page.waitForTimeout(600)
  }

  await browser.close()
  console.log('done', progress)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
