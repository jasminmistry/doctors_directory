import fs from 'fs'
import path from 'path'

const root = process.cwd()
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, 'public', file), 'utf8'))

const toSlug = (value) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const fold = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const dataTs = fs.readFileSync(path.join(root, 'src/lib/data.ts'), 'utf8')
const locations = [...dataTs.matchAll(/"([^"]+)"/g)]
  .map((match) => match[1])
  .filter((name) => name.length > 1 && name[0] === name[0].toUpperCase())

const searchCategories = [...dataTs.matchAll(/search_categories[\s\S]*?=\s*\[([\s\S]*?)\]/)]
  .flatMap((block) => [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]))

const blocked = new Set(['boxstart', 'east', 'latchmeads', 'north', 'south', 'st', 'west'])
const p0Cities = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol',
  'Liverpool', 'Newcastle', 'Sheffield', 'Nottingham', 'Leicester', 'Cardiff', 'Belfast',
  'Southampton', 'Brighton', 'Reading', 'Cambridge', 'Oxford', 'Norwich',
]
const allowed = new Set()
for (const city of p0Cities) allowed.add(toSlug(city))
for (const entry of readJson('city_data_processed.json')) {
  if (entry.City) allowed.add(toSlug(entry.City))
}

const locationBySlug = new Map(locations.map((label) => [toSlug(label), label]))
const searchCategorySlugs = new Set(searchCategories.map(toSlug))

const clinics = readJson('clinics_processed_new_data.json')
const practitioners = readJson('derms_processed_new_5403.json')
const treatmentsJson = readJson('treatments.json')
const products = readJson('products_processed_new.json')

const p0Treatments = [
  'Botox', 'Profhilo', 'Polynucleotides', 'Fillers', 'Chemical Peel', 'Micro-needling',
  'Ipl Treatment', 'Acne', 'HIFU', 'Microneedling With Radiofrequency', 'Morpheus8',
]
const matrixSlugs = new Set([
  ...p0Treatments.map(toSlug),
  'morpheus8', 'lemon-bottle', 'profhilo-structura', 'seventy-hyal', 'jawline-filler',
  'rf-microneedling', 'polynucleotides', 'non-surgical-rhinoplasty',
])

const matrixCities = [...new Set(clinics.map((c) => c.City?.trim()).filter(Boolean))]
  .filter((name) => {
    const slug = toSlug(name)
    return slug.length >= 4 && !blocked.has(slug) && allowed.has(slug)
  })

const treatmentNameBySlug = new Map()
for (const name of Object.keys(treatmentsJson)) {
  const slug = toSlug(name)
  if (!searchCategorySlugs.has(slug)) treatmentNameBySlug.set(slug, name)
}
for (const name of p0Treatments) treatmentNameBySlug.set(toSlug(name), name)

const index = new Map()
const bump = (treatmentSlug, locationSlug, field) => {
  if (searchCategorySlugs.has(treatmentSlug)) return
  if (!allowed.has(locationSlug) || locationSlug.length < 4 || blocked.has(locationSlug)) return
  if (!treatmentNameBySlug.has(treatmentSlug) && !matrixSlugs.has(treatmentSlug)) return
  const key = `${treatmentSlug}|${locationSlug}`
  const row = index.get(key) ?? { clinic: 0, prac: 0 }
  row[field] += 1
  index.set(key, row)
}

for (const clinic of clinics) {
  const locationSlug = toSlug(clinic.City)
  for (const treatment of clinic.Treatments ?? []) bump(toSlug(treatment), locationSlug, 'clinic')
}
for (const practitioner of practitioners) {
  const locationSlug = toSlug(practitioner.City)
  for (const treatment of practitioner.Treatments ?? []) bump(toSlug(treatment), locationSlug, 'prac')
}

const hubEntries = new Set()
for (const [key, row] of index) {
  if (row.clinic + row.prac >= 1) hubEntries.add(key)
}
for (const treatmentSlug of matrixSlugs) {
  for (const city of matrixCities) {
    const locationSlug = toSlug(city)
    if (!locationBySlug.has(locationSlug)) continue
    hubEntries.add(`${treatmentSlug}|${locationSlug}`)
  }
}

const hubList = [...hubEntries].map((key) => {
  const [treatmentSlug, locationSlug] = key.split('|')
  const row = index.get(key) ?? { clinic: 0, prac: 0 }
  return { treatmentSlug, locationSlug, clinicCount: row.clinic }
})
const bestInCity = hubList.filter((entry) => entry.clinicCount >= 3).length

const hubRegistry = fs.readFileSync(path.join(root, 'src/lib/treatment-hub-registry.ts'), 'utf8')
const matchTokenBlocks = [...hubRegistry.matchAll(/matchTokens:\s*\[([\s\S]*?)\]/g)]
const registryTokens = matchTokenBlocks.flatMap((block) =>
  [...block[1].matchAll(/'([^']+)'/g)].map((m) => fold(m[1]))
)

const treatmentTokens = (name) => {
  const tokens = new Set()
  const folded = fold(name)
  if (folded.length >= 4) tokens.add(folded)
  for (const word of name.toLowerCase().split(/[\s\-/]+/)) {
    const token = fold(word)
    if (token.length >= 4) tokens.add(token)
  }
  for (const token of registryTokens) {
    if (name.toLowerCase().includes('botox') && token.includes('botox')) tokens.add(token)
  }
  return [...tokens]
}

const productsForTreatment = (name) => {
  const tokens = treatmentTokens(name)
  return products.filter((product) => {
    const fields = [product.product_category, product.product_name, product.brand]
      .filter(Boolean)
      .map((value) => fold(value))
      .filter((value) => value.length >= 4)
    return tokens.some((token) =>
      fields.some((field) => field.includes(token) || token.includes(field))
    )
  })
}

const treatmentNames = Object.keys(treatmentsJson)
const treatmentProduct = treatmentNames.filter(
  (name) => productsForTreatment(name).length >= 2
).length
const standaloneTreatment = treatmentNames.length
const categories = new Set(products.map((p) => p.product_category).filter(Boolean))
const standaloneProductCategory = categories.size
const standaloneTotal = standaloneTreatment + standaloneProductCategory + treatmentProduct

const serviceCity = new Set()
for (const clinic of clinics) {
  const serviceSlug = toSlug(clinic.category)
  const locationSlug = toSlug(clinic.City)
  if (!searchCategories.map(toSlug).includes(serviceSlug)) continue
  if (!allowed.has(locationSlug)) continue
  serviceCity.add(`${serviceSlug}|${locationSlug}`)
}

const counts = {
  treatmentCityHub: hubEntries.size,
  bestInCity,
  standaloneTreatment,
  standaloneProductCategory,
  treatmentProduct,
  standaloneTotal,
  serviceCity: serviceCity.size,
  hubStyleTotal: hubEntries.size + bestInCity + standaloneTotal + serviceCity.size,
  matrixCities: matrixCities.length,
  matrixSlugs: matrixSlugs.size,
}

console.log(JSON.stringify(counts, null, 2))
