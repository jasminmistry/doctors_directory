// Canned Google Business Profile API responses for GBP_MOCK=true — lets the full
// connect -> bind -> pull -> edit -> sync flow (and its tests) run without Google API
// access approval. Shapes match the real Business Information / Account Management APIs.

export const MOCK_ACCOUNTS = {
  accounts: [
    {
      name: 'accounts/111111111111111111111',
      accountName: 'Demo Aesthetics Group',
      type: 'LOCATION_GROUP',
      verificationState: 'VERIFIED',
    },
  ],
}

export const MOCK_LOCATIONS = {
  locations: [
    {
      name: 'locations/222222222222222222222',
      title: 'Demo Aesthetics Clinic',
      storefrontAddress: {
        regionCode: 'GB',
        languageCode: 'en',
        postalCode: 'W1G 6BW',
        administrativeArea: 'Greater London',
        locality: 'London',
        addressLines: ['24 Wimpole Street'],
      },
      phoneNumbers: { primaryPhone: '+44 20 7946 0000' },
      metadata: {
        placeId: 'ChIJmock111DemoPlaceId',
        mapsUri: 'https://maps.google.com/?cid=1234567890',
        newReviewUri: 'https://search.google.com/local/writereview?placeid=ChIJmock111DemoPlaceId',
      },
    },
  ],
}

export function mockLocationDetail(name = 'locations/222222222222222222222') {
  return {
    name,
    title: 'Demo Aesthetics Clinic',
    storefrontAddress: MOCK_LOCATIONS.locations[0].storefrontAddress,
    phoneNumbers: { primaryPhone: '+44 20 7946 0000', additionalPhones: [] },
    categories: {
      primaryCategory: { name: 'gcid:medical_spa', displayName: 'Medical spa' },
      additionalCategories: [{ name: 'gcid:skin_care_clinic', displayName: 'Skin care clinic' }],
    },
    regularHours: {
      periods: [
        { openDay: 'MONDAY', openTime: { hours: 9 }, closeDay: 'MONDAY', closeTime: { hours: 17, minutes: 30 } },
        { openDay: 'TUESDAY', openTime: { hours: 9 }, closeDay: 'TUESDAY', closeTime: { hours: 17, minutes: 30 } },
      ],
    },
    serviceItems: [
      { freeFormServiceItem: { label: { displayName: 'Consultation' } } },
    ],
    websiteUri: 'https://demo-aesthetics.example.com',
    profile: { description: 'A demo clinic used for GBP connector testing.' },
    metadata: MOCK_LOCATIONS.locations[0].metadata,
  }
}

export function mockDispatch(url: string, init?: RequestInit): Response {
  const method = (init?.method ?? 'GET').toUpperCase()

  if (url.includes('/accounts') && !url.includes('/locations')) {
    return json(MOCK_ACCOUNTS)
  }
  if (url.includes('/locations') && method === 'GET' && !/locations\/\d/.test(url)) {
    return json(MOCK_LOCATIONS)
  }
  if (/locations\/\d+/.test(url) && method === 'GET') {
    const m = url.match(/(locations\/\d+)/)
    return json(mockLocationDetail(m ? m[1] : undefined))
  }
  if (method === 'PATCH') {
    return json({ ...JSON.parse((init?.body as string) || '{}'), name: url.split('?')[0].split('/v1/')[1] })
  }
  if (url.includes(':startUpload')) {
    return json({ resourceName: 'accounts/111/locations/222/media/uploads/mock-upload-ref' })
  }
  if (url.includes('/media') && method === 'POST') {
    return json({ name: 'accounts/111/locations/222/media/mock-media-1', state: 'PROCESSING' })
  }
  if (url.includes('/placeActionLinks')) {
    return json({ name: 'locations/222/placeActionLinks/mock', uri: 'https://demo-aesthetics.example.com/book' })
  }
  if (url.includes('/categories')) {
    return json({
      categories: [
        { name: 'gcid:medical_spa', displayName: 'Medical spa' },
        { name: 'gcid:skin_care_clinic', displayName: 'Skin care clinic' },
        { name: 'gcid:dermatologist', displayName: 'Dermatologist' },
      ],
    })
  }
  return json({})
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
