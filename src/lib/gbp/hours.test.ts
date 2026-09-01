import { periodsToDisplayMap, periodToGbp, isValidHHMM } from '@/lib/gbp/hours'

describe('periodsToDisplayMap', () => {
  test('renders a single period per day and Closed elsewhere', () => {
    const map = periodsToDisplayMap([
      { openDay: 'Monday', openTime: '09:00', closeDay: 'Monday', closeTime: '17:30' },
    ])
    expect(map.Monday).toBe('09:00–17:30')
    expect(map.Tuesday).toBe('Closed')
  })

  test('joins split shifts on the same day in time order', () => {
    const map = periodsToDisplayMap([
      { openDay: 'Monday', openTime: '13:00', closeDay: 'Monday', closeTime: '17:00', sortOrder: 1 },
      { openDay: 'Monday', openTime: '09:00', closeDay: 'Monday', closeTime: '12:00', sortOrder: 0 },
    ])
    expect(map.Monday).toBe('09:00–12:00, 13:00–17:00')
  })
})

describe('periodToGbp', () => {
  test('maps HH:MM to {hours,minutes} and upper-cases days', () => {
    expect(periodToGbp({ openDay: 'Monday', openTime: '09:05', closeDay: 'Tuesday', closeTime: '01:30' })).toEqual({
      openDay: 'MONDAY',
      openTime: { hours: 9, minutes: 5 },
      closeDay: 'TUESDAY',
      closeTime: { hours: 1, minutes: 30 },
    })
  })
})

describe('isValidHHMM', () => {
  test.each([
    ['09:00', true],
    ['23:59', true],
    ['24:00', false],
    ['9:00', false],
    ['09:60', false],
  ])('%s -> %s', (v, expected) => {
    expect(isValidHHMM(v)).toBe(expected)
  })
})
