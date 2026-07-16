const fs = require('fs')
const path = require('path')

const clinicsPath = path.join(__dirname, '../public/clinics_processed_new_data.json')
const slugListPath = path.join(__dirname, '../src/lib/data/consentz-customer-slugs.json')
const reportPath = path.join(__dirname, '../coverage/toby-feedback-2026-07-13/point-6-consentz-import-plan.json')
const migrationPath = path.join(__dirname, '../prisma/migrations/20260716140000_seed_consentz_excel_clinics/migration.sql')

const DEFAULT_IMG = '/directory/images/default-dr-profile-1.webp'

const NEW_CLINICS = [
  { slug: '111-harley-st', name: '111 Harley St.', city: 'London', website: 'https://www.111harleystreet.com/', address: '111 Harley Street, London W1, United Kingdom' },
  { slug: 'aintree-aesthetics-limited', name: 'Aintree Aesthetics Limited', city: 'Liverpool', website: 'http://aintreeaesthetics.co.uk/', address: 'Aintree, Liverpool, United Kingdom' },
  { slug: 'adam-goodwin-surgery', name: 'Adam Goodwin Surgery', city: 'Manchester', website: 'https://adamgoodwinsurgery.com/', address: 'Manchester, United Kingdom' },
  { slug: 'choice-aesthetics-bmi', name: 'Choice Aesthetics (BMI)', city: 'London', website: 'https://choiceaesthetic.com', address: 'London / Surrey, United Kingdom' },
  { slug: 'clinic-aesthetics', name: 'Clinic Aesthetics', city: 'London', website: 'https://clinicat.co.uk/', address: 'Harley Street, London, United Kingdom' },
  { slug: 'dhi-london-dhi-global-medical-group', name: 'DHI London (DHI Global Medical Group)', city: 'London', website: 'https://dhiglobal.com/', address: 'London W1, United Kingdom' },
  { slug: 'dr-brian-franks', name: 'Dr Brian Franks', city: 'London', website: 'https://www.drbrianfranks.com/', address: 'London / Weybridge, United Kingdom' },
  { slug: 'dr-hanson-clinic', name: 'Dr Hanson Clinic', city: 'London', website: 'https://www.drhanson.co.uk/', address: 'Harley Street, London, United Kingdom' },
  { slug: 'dr-harris-clinic', name: 'Dr Harris Clinic', city: 'London', website: 'https://harrisclinic.co.uk/', address: 'London NW1, United Kingdom' },
  { slug: 'dr-paul-baines-skin-health-the-crescent-clinic', name: 'Dr Paul Baines - Skin Health (The Crescent Clinic)', city: 'Bristol', website: 'https://www.drbaines.com/', address: 'Taunton, United Kingdom' },
  { slug: 'dr-rhys', name: 'DR RHYS', city: 'London', website: 'https://www.drrhys.com/', address: 'London / Tadworth, United Kingdom' },
  { slug: 'dr-ruthie-aesthetics', name: 'Dr Ruthie Aesthetics', city: 'Eastbourne', website: 'https://www.drruthie.co.uk/', address: 'East Sussex, United Kingdom' },
  { slug: 'dr-veerle-rotsaert', name: 'Dr Veerle Rotsaert', city: 'London', website: 'https://doctorv.co.uk/', address: 'Belgravia, London, United Kingdom' },
  { slug: 'efface-aesthetics', name: 'Efface Aesthetics', city: 'Birmingham', website: 'https://effaceaesthetics.com/', address: 'Birmingham, United Kingdom' },
  { slug: 'face-et-al-medical-aesthetics', name: 'Face et al Medical Aesthetics', city: 'Darlington', website: '', address: 'Darlington, United Kingdom' },
  { slug: 'gerson-medical', name: 'Gerson Medical', city: 'London', website: '', address: 'United Kingdom' },
  { slug: 'isobel-wood-ltd', name: 'Isobel Wood Ltd', city: 'London', website: 'https://www.isobelwood.co.uk', address: 'London / Cambridge / Royston, United Kingdom' },
  { slug: 'light-touch-clinic', name: 'Light Touch Clinic', city: 'London', website: 'http://lighttouchclinic.co.uk/', address: 'Weybridge, Surrey, United Kingdom' },
  { slug: 'maison-aesthetique', name: 'Maison Aesthetique', city: 'Plymouth', website: 'http://www.maisonaesthetique.co.uk/', address: 'Totnes, Devon, United Kingdom' },
  { slug: 'manchester-plastic-surgery', name: 'Manchester Plastic Surgery', city: 'Manchester', website: 'https://www.manchesterplasticsurgery.com/', address: 'Manchester, United Kingdom' },
  { slug: 'natural-visage-aesthetics', name: 'Natural Visage Aesthetics', city: 'Pontypool', website: 'https://naturalvisage.co.uk', address: 'Pontypool, United Kingdom' },
  { slug: 'np-charlotte-medical-aesthetic', name: 'NP Charlotte Medical & Aesthetic', city: 'London', website: '', address: 'United Kingdom' },
  { slug: 'orassy-health', name: 'Orassy Health', city: 'London', website: 'https://www.orassyhealth.com/', address: 'London E14, United Kingdom' },
  { slug: 'oxford-aesthetics', name: 'Oxford Aesthetics', city: 'Oxford', website: 'https://www.oxfordaesthetics.co.uk/', address: 'Bicester / London / Glasgow, United Kingdom' },
  { slug: 'sc-skin-aesthetics', name: 'SC Skin & Aesthetics', city: 'Fareham', website: 'http://scaesthetics.booksy.com/', address: 'Fareham, United Kingdom' },
  { slug: 'selston-cosmetic-clinic', name: 'Selston Cosmetic Clinic', city: 'Nottingham', website: 'https://www.selstoncosmeticclinic.com/', address: 'Nottinghamshire, United Kingdom' },
  { slug: 'sholema-aesthetics-laser-limited', name: 'Sholema Aesthetics & Laser Limited', city: 'London', website: 'https://sholemaclinics.com', address: 'United Kingdom' },
  { slug: 'skin-solutions-oxford', name: 'Skin Solutions Oxford', city: 'Oxford', website: 'https://skinsolutionsoxford.co.uk/', address: 'Abingdon / Oxford area, United Kingdom' },
  { slug: 'tempus-intl-ltd', name: 'Tempus Intl Ltd', city: 'London', website: 'https://tempusbelgravia.co.uk', address: 'Belgravia, London, United Kingdom' },
  { slug: 'the-academy-beauty-room', name: 'The Academy & Beauty Room', city: 'Norwich', website: 'https://theacademyandbeautyroom.com/', address: 'Lowestoft, United Kingdom' },
  { slug: 'the-centre', name: 'The Centre', city: 'London', website: 'https://londonfacialplasticsurgery.co.uk', address: 'Harley Street, London, United Kingdom' },
  { slug: 'the-d-souza-clinic', name: "The D'Souza Clinic", city: 'London', website: 'https://www.thedsouzaclinic.com/', address: 'London W1, United Kingdom' },
  { slug: 'the-face-aesthetic-skin-clinic', name: 'The Face – Aesthetic Skin Clinic', city: 'Billericay', website: 'https://www.theface.org.uk/', address: 'Billericay, Essex, United Kingdom' },
  { slug: 'the-grove-clinic', name: 'The Grove Clinic', city: 'Canterbury', website: 'https://www.thegroveclinic.co.uk/', address: 'Godmersham / Canterbury area, United Kingdom' },
  { slug: 'the-medi-shed-by-dr-dil', name: 'The Medi-Shed by Dr Dil', city: 'London', website: 'https://www.drdil.co.uk/', address: 'Balham, London, United Kingdom' },
  { slug: 'the-private-clinic', name: 'The Private Clinic', city: 'London', website: 'https://www.theprivateclinic.co.uk/', address: 'Harley Street, London, United Kingdom' },
  { slug: 'utopian-aesthetics', name: 'Utopian Aesthetics', city: 'London', website: '', address: 'United Kingdom' },
  { slug: 'yapa-plastic-surgery', name: 'Yapa Plastic Surgery', city: 'London', website: 'https://yapaplasticsurgery.com/', address: 'Harley Street, London, United Kingdom' },
]

function makeClinic(def) {
  const about = def.website
    ? `${def.name} is a Consentz customer clinic listed in the UK Aesthetic Directory.`
    : `${def.name} is a Consentz customer clinic listed in the UK Aesthetic Directory. Details are pending verification.`
  return {
    slug: def.slug,
    image: DEFAULT_IMG,
    url: def.website || '',
    rating: 0,
    reviewCount: 0,
    category: 'Aesthetic clinic',
    gmapsAddress: def.address,
    gmapsPhone: '',
    reviewAnalysis: {},
    weighted_analysis: {},
    City: def.city,
    x_twitter: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    Linkedin: '',
    website: def.website || '',
    email: '',
    isSaveFace: false,
    isDoctor: false,
    isJCCP: [false, ''],
    isCQC: [false, ''],
    isHIW: [false, ''],
    isHIS: [false, ''],
    isRQIA: [false, ''],
    about_section: about,
    accreditations: JSON.stringify(['Consentz Customer']),
    hours: {},
    Practitioners: '',
    Insurace: [],
    Payments: [],
    Fees: [],
    Treatments: [],
    criteria_breakdown: {},
    advice: {},
    ranking: {},
    isConsentz: true,
  }
}

const clinics = JSON.parse(fs.readFileSync(clinicsPath, 'utf8'))
const existingSlugs = new Set(clinics.map((c) => c.slug))
const slugList = JSON.parse(fs.readFileSync(slugListPath, 'utf8'))
const slugSet = new Set(slugList)

const added = []
const skipped = []

for (const def of NEW_CLINICS) {
  if (existingSlugs.has(def.slug)) {
    skipped.push(def.slug)
    continue
  }
  clinics.push(makeClinic(def))
  existingSlugs.add(def.slug)
  added.push(def)
  slugSet.add(def.slug)
}

for (const clinic of clinics) {
  if (slugSet.has(clinic.slug)) {
    clinic.isConsentz = true
    clinic.accreditations = JSON.stringify(['Consentz Customer'])
  }
}

fs.writeFileSync(clinicsPath, JSON.stringify(clinics))
fs.writeFileSync(slugListPath, JSON.stringify([...slugSet].sort(), null, 2) + '\n')

const sqlLines = [
  '-- Seed Consentz Excel clinics for profile pages (MySQL)',
  '',
]

for (const def of added) {
  const name = def.name.replace(/'/g, "''")
  const website = (def.website || '').replace(/'/g, "''")
  const address = def.address.replace(/'/g, "''")
  const citySlug = def.city.toLowerCase().replace(/\s+/g, '-')
  const acc = JSON.stringify(['Consentz Customer']).replace(/'/g, "''")
  sqlLines.push(`INSERT INTO \`cities\` (\`slug\`, \`name\`, \`createdAt\`, \`updatedAt\`)
SELECT '${citySlug}', '${def.city.replace(/'/g, "''")}', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM \`cities\` WHERE \`slug\` = '${citySlug}');`)
  sqlLines.push('')
  sqlLines.push(`INSERT INTO \`clinics\` (\`slug\`, \`cityId\`, \`name\`, \`image\`, \`gmapsAddress\`, \`website\`, \`category\`, \`rating\`, \`reviewCount\`, \`aboutSection\`, \`accreditations\`, \`isSaveFace\`, \`isDoctor\`, \`createdAt\`, \`updatedAt\`)
SELECT '${def.slug}', c.id, '${name}', '${DEFAULT_IMG}', '${address}', '${website}', 'Aesthetic clinic', 0, 0, '${name.replace(/'/g, "''")} is a Consentz customer clinic.', '${acc}', 0, 0, NOW(3), NOW(3)
FROM \`cities\` c
WHERE c.slug = '${citySlug}'
  AND NOT EXISTS (SELECT 1 FROM \`clinics\` WHERE \`slug\` = '${def.slug}');`)
  sqlLines.push('')
}

fs.mkdirSync(path.dirname(migrationPath), { recursive: true })
fs.writeFileSync(migrationPath, sqlLines.join('\n'))

const report = {
  generatedAt: new Date().toISOString(),
  status: 'complete',
  totalExcelRows: 50,
  skippedUS: [{ row: 4, name: 'Barrett Plastic Surgery' }],
  skippedInactiveByDax: [
    { row: 6, name: 'Dr Camilla Hill Facial Aesthetics Clinic' },
    { row: 15, name: 'Simon Lee Aesthetic Medical Clinic' },
    { row: 39, name: 'Miller Medical Professionals Ltd.' },
    { row: 40, name: 'The MÖ Aesthetic Clinic' },
  ],
  targetConsentzSlugs: [...slugSet].sort(),
  jsonClinicsTotal: clinics.length,
  newlyAddedCount: added.length,
  newlyAdded: added.map((d) => ({ slug: d.slug, city: d.city, website: d.website || null })),
  skippedExistingSlugs: skipped,
  migration: 'prisma/migrations/20260716140000_seed_consentz_excel_clinics/migration.sql',
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log(JSON.stringify({ added: added.length, skipped, total: clinics.length, slugs: slugSet.size }, null, 2))
