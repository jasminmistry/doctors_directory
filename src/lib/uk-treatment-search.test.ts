import {
  matchTreatmentOption,
  resolveDirectorySearchHref,
  resolveUkTreatmentSearchHref,
} from '@/lib/uk-treatment-search'

const options = [
  { name: 'Botox', slug: 'botox' },
  { name: 'Acne', slug: 'acne' },
  { name: 'Chemical Peel', slug: 'chemical-peel' },
]

describe('resolveUkTreatmentSearchHref', () => {
  it('routes treatment plus city to treatment city hub', () => {
    expect(resolveUkTreatmentSearchHref('Botox', 'London', options)).toBe(
      '/botox/london/'
    )
  })

  it('routes treatment only to national treatment page', () => {
    expect(resolveUkTreatmentSearchHref('Acne', '', options)).toBe(
      '/treatments/acne/'
    )
  })
})

describe('resolveDirectorySearchHref', () => {
  it('routes clinic treatment city to clinics services page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Clinic', query: 'Botox', location: 'London' },
        options
      )
    ).toBe('/clinics/london/services/botox/')
  })

  it('routes clinic city only to clinics city page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Clinic', query: '', location: 'Manchester' },
        options
      )
    ).toBe('/clinics/manchester/')
  })

  it('routes practitioner treatment city to practitioners treatments page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Practitioner', query: 'Chemical Peel', location: 'Birmingham' },
        options
      )
    ).toBe('/practitioners/birmingham/treatments/chemical-peel/')
  })

  it('routes practitioner city only to practitioners city page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Practitioner', query: '', location: 'Oxford' },
        options
      )
    ).toBe('/practitioners/oxford/')
  })

  it('routes treatments type through treatment hub urls', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Treatments', query: 'botox', location: 'london' },
        options
      )
    ).toBe('/botox/london/')
  })

  it('falls back to city clinic page when treatments query is empty', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Treatments', query: '', location: 'Leeds' },
        options
      )
    ).toBe('/clinics/leeds/')
  })

  it('returns null for free text clinic name with no city', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Clinic', query: 'Some Unique Clinic Name', location: '' },
        options
      )
    ).toBeNull()
  })

  it('returns null for free text clinic name with city so search can run', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Clinic', query: 'Adonia Medical Clinic', location: 'London' },
        options
      )
    ).toBeNull()
  })

  it('matches partial treatment names', () => {
    expect(matchTreatmentOption('chemical', options)?.slug).toBe('chemical-peel')
  })
})
