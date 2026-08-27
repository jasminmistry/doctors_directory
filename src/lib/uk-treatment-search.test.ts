import {
  matchBrandSlug,
  matchSearchCategorySlug,
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
  it('routes treatment plus city to clinic listing page', () => {
    expect(resolveUkTreatmentSearchHref('Botox', 'London', options)).toBe(
      '/clinics/london/services/botox/'
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

  it('routes clinic category plus city to service city page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Clinic', query: 'Beauty Parlour', location: 'London' },
        options
      )
    ).toBe('/beauty-parlour/london/')
  })

  it('routes practitioner treatment city to practitioners treatments page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Practitioner', query: 'Chemical Peel', location: 'Birmingham' },
        options
      )
    ).toBe('/practitioners/birmingham/treatments/chemical-peel/')
  })

  it('routes practitioner city with category query to practitioners city page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Practitioner', query: 'Beauty Parlour', location: 'London' },
        options
      )
    ).toBe('/practitioners/london/')
  })

  it('routes practitioner category query without city to practitioners index', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Practitioner', query: 'Beauty Parlour', location: '' },
        options
      )
    ).toBe('/practitioners/')
  })

  it('routes practitioner city only to practitioners city page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Practitioner', query: '', location: 'Oxford' },
        options
      )
    ).toBe('/practitioners/oxford/')
  })

  it('routes treatments type to clinic listing page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Treatments', query: 'botox', location: 'london' },
        options
      )
    ).toBe('/clinics/london/services/botox/')
  })

  it('falls back to city clinic page when treatments query is empty', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Treatments', query: '', location: 'Leeds' },
        options
      )
    ).toBe('/clinics/leeds/')
  })

  it('routes product category search to category page', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Product', query: 'Cosmetics', location: '' },
        options
      )
    ).toBe('/products/category/cosmetics/')
  })

  it('does not partial-match Cosmetics to a brand name', () => {
    expect(matchBrandSlug('Cosmetics')).toBeNull()
  })

  it('routes product category search to service city page when city is set', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Product', query: 'Beautician', location: 'London' },
        options
      )
    ).toBe('/beautician/london/')
  })

  it('routes product search without city to products index', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Product', query: 'Beautician', location: '' },
        options
      )
    ).toBe('/products/')
  })

  it('routes free text clinic name to clinics index instead of search', () => {
    expect(
      resolveDirectorySearchHref(
        { type: 'Clinic', query: 'Adonia Medical Clinic', location: 'London' },
        options
      )
    ).toBe('/clinics/london/')
  })

  it('matches partial treatment names', () => {
    expect(matchTreatmentOption('chemical', options)?.slug).toBe('chemical-peel')
  })

  it('matches search categories', () => {
    expect(matchSearchCategorySlug('beauty parlour')).toBe('beauty-parlour')
  })
})
