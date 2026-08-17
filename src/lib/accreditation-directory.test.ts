import type { Clinic } from '@/lib/types'
import {
  clinicCityMatchesSlug,
  clinicMatchesAccreditation,
  filterClinicsByAccreditation,
} from '@/lib/accreditation-directory'
import { isDirectoryTestListing } from '@/lib/consentz-customers'
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
})
