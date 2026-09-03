import { buildLocationPatches, type ClinicSyncData } from '@/lib/gbp/business-info'

const DATA: ClinicSyncData = {
  name: 'Demo Clinic',
  website: 'https://demo.example.com',
  description: 'x'.repeat(900),
  gbpPrimaryPhone: '+44 20 7946 0000',
  additionalPhones: ['+44 20 7946 0001', ''],
  gbpPrimaryCategoryId: 'gcid:medical_spa',
  gbpAdditionalCategories: [{ id: 'gcid:skin_care_clinic', name: 'Skin care clinic' }],
  gbpServiceArea: null,
  address: {
    regionCode: 'GB',
    languageCode: 'en',
    postalCode: 'W1G 6BW',
    administrativeArea: 'Greater London',
    locality: 'London',
    sublocality: null,
    addressLines: ['24 Wimpole Street'],
  },
  hourPeriods: [{ openDay: 'Monday', openTime: '09:00', closeDay: 'Monday', closeTime: '17:30' }],
  services: [{ name: 'Consultation', description: null, isFreeForm: true, categoryId: null }],
}

describe('buildLocationPatches', () => {
  test('excludes name + address unless includeNameAddress', () => {
    const groups = buildLocationPatches(DATA, { includeNameAddress: false })
    const fields = groups.map((g) => g.field)
    expect(fields).not.toContain('name')
    expect(fields).not.toContain('address')
    expect(fields).toEqual(expect.arrayContaining(['phones', 'categories', 'hours', 'services', 'profile']))
  })

  test('includes name + address (marked risky) when confirmed', () => {
    const groups = buildLocationPatches(DATA, { includeNameAddress: true })
    const name = groups.find((g) => g.field === 'name')
    const address = groups.find((g) => g.field === 'address')
    expect(name?.risky).toBe(true)
    expect(address?.risky).toBe(true)
    expect(name?.updateMask).toBe('title')
    expect(address?.updateMask).toBe('storefrontAddress')
  })

  test('phones patch drops blank additional phones', () => {
    const phones = buildLocationPatches(DATA, { includeNameAddress: false }).find((g) => g.field === 'phones')
    expect((phones?.body.phoneNumbers as { additionalPhones: string[] }).additionalPhones).toEqual([
      '+44 20 7946 0001',
    ])
  })

  test('hours patch maps to {hours,minutes} periods', () => {
    const hours = buildLocationPatches(DATA, { includeNameAddress: false }).find((g) => g.field === 'hours')
    expect((hours?.body.regularHours as { periods: unknown[] }).periods).toEqual([
      { openDay: 'MONDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'MONDAY', closeTime: { hours: 17, minutes: 30 } },
    ])
  })

  test('description is truncated to 750 chars', () => {
    const profile = buildLocationPatches(DATA, { includeNameAddress: false }).find((g) => g.field === 'profile')
    expect((profile?.body.profile as { description: string }).description).toHaveLength(750)
  })

  test('categories patch uses gcid names', () => {
    const cat = buildLocationPatches(DATA, { includeNameAddress: false }).find((g) => g.field === 'categories')
    expect(cat?.body.categories).toEqual({
      primaryCategory: { name: 'gcid:medical_spa' },
      additionalCategories: [{ name: 'gcid:skin_care_clinic' }],
    })
  })
})
