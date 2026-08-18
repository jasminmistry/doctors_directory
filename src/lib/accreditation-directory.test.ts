import type { Clinic } from '@/lib/types'
import {
  clinicCityMatchesSlug,
  clinicMatchesAccreditation,
  filterClinicsByAccreditation,
  getAccreditedPractitioners,
  getConsentzAccreditedPractitioners,
  practitionerMatchesAccreditation,
} from '@/lib/accreditation-directory'
import { applyPrestigeToClinic } from '@/lib/prestige-accreditations'
import { isConsentzLinked, isDirectoryTestListing } from '@/lib/consentz-customers'
import { readJsonFileSync } from '@/lib/json-cache'

function clinic(partial: Partial<Clinic> & Pick<Clinic, 'slug'>): Clinic {
  return {
    slug: partial.slug,
    image: '',
    url: undefined,
    rating: 0,
    reviewCount: 0,
    category: '',
    gmapsAddress: '',
    gmapsPhone: '',
    City: partial.City ?? '',
    facebook: '',
    twitter: '',
    Linkedin: '',
    instagram: '',
    youtube: '',
    website: '',
    email: '',
    isSaveFace: false,
    isDoctor: false,
    isJCCP: null,
    isCQC: null,
    isHIW: null,
    isHIS: null,
    isRQIA: null,
    about_section: '',
    accreditations: '',
    awards: '',
    affiliations: '',
    hours: '',
    Practitioners: '',
    Insurace: '',
    Payments: '',
    Fees: '',
    x_twitter: '',
    claimed: partial.claimed,
    isConsentz: partial.isConsentz,
  }
}

describe('Consentz accredited matching', () => {
  test('uses the Excel customer list instead of claimed clinics', () => {
    expect(
      clinicMatchesAccreditation(
        clinic({ slug: 'random-claimed-clinic', claimed: true, City: 'Aberdare' }),
        'consentz',
      ),
    ).toBe(false)

    expect(
      clinicMatchesAccreditation(
        clinic({ slug: '111-harley-st', claimed: false, City: 'London' }),
        'consentz',
      ),
    ).toBe(true)
  })

  test('excludes QA and test listings', () => {
    expect(isDirectoryTestListing('qa-test-17-july')).toBe(true)
    expect(isDirectoryTestListing('test-user-clinic')).toBe(true)
    expect(isDirectoryTestListing('qa-clinic-15aug')).toBe(true)
    expect(
      clinicMatchesAccreditation(
        clinic({ slug: 'qa-test-17-july', claimed: true, isConsentz: true, City: 'Aberdare' }),
        'consentz',
      ),
    ).toBe(false)
  })

  test('city cards come from Excel customers, not Aberdare test rows', () => {
    const clinics = readJsonFileSync('clinics_processed_new_data.json') as Clinic[]
    const consentzClinics = filterClinicsByAccreditation(clinics, 'consentz')
    const londonCount = consentzClinics.filter((entry) =>
      clinicCityMatchesSlug(entry.City, 'london'),
    ).length
    const aberdareCount = consentzClinics.filter((entry) =>
      clinicCityMatchesSlug(entry.City, 'aberdare'),
    ).length

    expect(consentzClinics).toHaveLength(42)
    expect(londonCount).toBe(21)
    expect(aberdareCount).toBe(0)
  })

  test('accredited practitioners come from Excel-linked clinics, not claimed QA rows', () => {
    const practitioners = getConsentzAccreditedPractitioners()
    const cities = [...new Set(practitioners.map((entry) => entry.City).filter(Boolean))]
    expect(practitioners.length).toBeGreaterThan(0)
    expect(cities).not.toContain('Aberdare')
    expect(
      practitioners.every((entry) => practitionerMatchesAccreditation(entry, 'consentz')),
    ).toBe(true)
    expect(
      practitioners.some((entry) => /qa test|test user|qa clinic/i.test(entry.practitioner_name ?? '')),
    ).toBe(false)
  })

  test('Tatler accredited clinics include The Wellness Atelier with prestige labels', () => {
    const clinics = (readJsonFileSync('clinics_processed_new_data.json') as Clinic[]).map(
      (entry) => applyPrestigeToClinic(entry),
    )
    const tatlerClinics = filterClinicsByAccreditation(clinics, 'tatler')
    const awardsClinics = filterClinicsByAccreditation(clinics, 'aesthetics-awards')
    const wellness = tatlerClinics.find((entry) => entry.slug === 'the-wellness-atelier')

    expect(wellness).toBeDefined()
    expect(wellness?.tatlerBadgeLabel).toBe('Tatler Guide 2025')
    expect(wellness?.awardsBadgeLabel).toBe('Aesthetics Awards Winner 2025')
    expect(awardsClinics.some((entry) => entry.slug === 'the-wellness-atelier')).toBe(true)
    expect(
      tatlerClinics.every((entry) => !clinicCityMatchesSlug(entry.City, 'aberdare')),
    ).toBe(true)
  })

  test('accredited prestige practitioners have cities and prestige labels', () => {
    const tatlerPractitioners = getAccreditedPractitioners('tatler')
    const awardsPractitioners = getAccreditedPractitioners('aesthetics-awards')

    expect(tatlerPractitioners.length).toBeGreaterThan(0)
    expect(awardsPractitioners.length).toBeGreaterThan(0)
    expect(tatlerPractitioners.every((entry) => Boolean(entry.City))).toBe(true)
    expect(tatlerPractitioners.every((entry) => Boolean(entry.tatlerBadgeLabel))).toBe(true)
    expect(awardsPractitioners.every((entry) => Boolean(entry.awardsBadgeLabel))).toBe(true)
    expect(tatlerPractitioners.every((entry) => entry.City !== 'Aberdare')).toBe(true)
    expect(awardsPractitioners.every((entry) => entry.City !== 'Aberdare')).toBe(true)
  })

  test('Consentz linked helper matches associated clinic slugs', () => {
    expect(isConsentzLinked({ slug: '111-harley-st' })).toBe(true)
    expect(
      isConsentzLinked({
        practitioner_name: 'dr-vasos-vrachimi',
        Associated_Clinics: '["dr-vas"]',
      }),
    ).toBe(true)
    expect(
      isConsentzLinked({
        practitioner_name: 'qa-test-17-july',
        Associated_Clinics: '["dr-vas"]',
      }),
    ).toBe(false)
  })
})
