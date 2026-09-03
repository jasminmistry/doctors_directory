import { gbpLocationToDirectory, diffFields } from '@/lib/gbp/mappers'

const LOCATION = {
  name: 'locations/222',
  title: 'Demo Clinic',
  storefrontAddress: {
    regionCode: 'GB',
    postalCode: 'W1G 6BW',
    locality: 'London',
    addressLines: ['24 Wimpole Street'],
  },
  phoneNumbers: { primaryPhone: '+44 20 7946 0000', additionalPhones: ['+44 20 7946 0001'] },
  categories: {
    primaryCategory: { name: 'gcid:medical_spa', displayName: 'Medical spa' },
    additionalCategories: [{ name: 'gcid:skin_care_clinic', displayName: 'Skin care clinic' }],
  },
  regularHours: {
    periods: [
      { openDay: 'MONDAY', openTime: { hours: 9 }, closeDay: 'MONDAY', closeTime: { hours: 17, minutes: 30 } },
    ],
  },
  serviceItems: [{ freeFormServiceItem: { label: { displayName: 'Consultation' } } }],
  websiteUri: 'https://demo.example.com',
  profile: { description: 'Hello' },
  metadata: { placeId: 'ChIJdemo', newReviewUri: 'https://g/review' },
}

describe('gbpLocationToDirectory', () => {
  const mapped = gbpLocationToDirectory(LOCATION)

  test('maps address, phones, website, description, placeId', () => {
    expect(mapped.placeId).toBe('ChIJdemo')
    expect(mapped.website).toBe('https://demo.example.com')
    expect(mapped.description).toBe('Hello')
    expect(mapped.gbpPrimaryPhone).toBe('+44 20 7946 0000')
    expect(mapped.additionalPhones).toEqual(['+44 20 7946 0001'])
    expect(mapped.address?.addressLines).toEqual(['24 Wimpole Street'])
    expect(mapped.address?.postalCode).toBe('W1G 6BW')
  })

  test('maps categories with gcid + display name', () => {
    expect(mapped.primaryCategory).toEqual({ id: 'gcid:medical_spa', name: 'Medical spa' })
    expect(mapped.additionalCategories).toEqual([{ id: 'gcid:skin_care_clinic', name: 'Skin care clinic' }])
  })

  test('maps hour periods to HH:MM', () => {
    expect(mapped.hourPeriods).toEqual([
      { openDay: 'Monday', openTime: '09:00', closeDay: 'Monday', closeTime: '17:30' },
    ])
  })

  test('maps free-form service items', () => {
    expect(mapped.services).toEqual([{ name: 'Consultation', description: null, isFreeForm: true }])
  })
})

describe('diffFields', () => {
  test('flags fields that differ from current', () => {
    const incoming = gbpLocationToDirectory(LOCATION)
    const diff = diffFields({ website: 'https://old.example.com', placeId: 'ChIJdemo' }, incoming)
    const fields = diff.map((d) => d.field)
    expect(fields).toContain('website')
    expect(fields).not.toContain('placeId')
  })
})
