import { ensureServiceCityHrefExists } from './directory-search-routing'

jest.mock('./directory-seo-pages', () => ({
  getServiceCityEntry: jest.fn(),
}))

jest.mock('./treatment-city-hub', () => ({
  getTreatmentCityHubEntry: jest.fn(),
}))

import { getServiceCityEntry } from './directory-seo-pages'
import { getTreatmentCityHubEntry } from './treatment-city-hub'

const mockedGetServiceCityEntry = getServiceCityEntry as jest.MockedFunction<
  typeof getServiceCityEntry
>
const mockedGetTreatmentCityHubEntry =
  getTreatmentCityHubEntry as jest.MockedFunction<typeof getTreatmentCityHubEntry>

describe('ensureServiceCityHrefExists', () => {
  beforeEach(() => {
    mockedGetServiceCityEntry.mockReset()
    mockedGetTreatmentCityHubEntry.mockReset()
  })

  it('keeps href when service city page exists', () => {
    mockedGetServiceCityEntry.mockReturnValue({
      serviceSlug: 'beauty-parlour',
      serviceLabel: 'Beauty Parlour',
      locationSlug: 'london',
      locationLabel: 'London',
      clinicCount: 9,
    })
    mockedGetTreatmentCityHubEntry.mockReturnValue(null)

    expect(ensureServiceCityHrefExists('/beauty-parlour/london/')).toBe(
      '/beauty-parlour/london/'
    )
  })

  it('falls back to city clinics when service city page is missing', () => {
    mockedGetServiceCityEntry.mockReturnValue(null)
    mockedGetTreatmentCityHubEntry.mockReturnValue(null)

    expect(ensureServiceCityHrefExists('/beautician/london/')).toBe(
      '/clinics/london/'
    )
  })

  it('keeps treatment hub href when hub page exists', () => {
    mockedGetServiceCityEntry.mockReturnValue(null)
    mockedGetTreatmentCityHubEntry.mockReturnValue({
      treatmentSlug: 'botox',
      treatmentName: 'Botox',
      locationSlug: 'london',
      locationLabel: 'London',
      clinicCount: 10,
      practitionerCount: 5,
      listingCount: 15,
    } as never)

    expect(ensureServiceCityHrefExists('/botox/london/')).toBe('/botox/london/')
  })

  it('does not rewrite reserved multi-segment paths', () => {
    expect(ensureServiceCityHrefExists('/clinics/london/services/botox/')).toBe(
      '/clinics/london/services/botox/'
    )
  })
})
