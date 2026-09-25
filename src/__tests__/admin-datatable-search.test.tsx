import { fireEvent, render, screen } from '@testing-library/react'
import { DataTable, tokenizeSearch } from '../components/admin/DataTable'
import { compareClinicListingOrder } from '../lib/consentz-customers'

const rows = [
  { id: 111, slug: 'abbey-clinic', name: 'Abbey Clinic', gmapsPhone: '020 7946 0111', claimed: false, isConsentz: false },
  { id: 2, slug: 'zeta-aesthetics', name: 'Zeta Aesthetics', gmapsPhone: '0161 000 0000', claimed: false, isConsentz: false },
  { id: 3, slug: '111-harley-st', name: '111 Harley St', gmapsPhone: '020 0000 0000', claimed: true, isConsentz: true },
]

const columns = [{ key: 'name', label: 'Name' }]

function names() {
  return screen.queryAllByRole('row').slice(1).map((r) => r.textContent)
}

function search(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value } })
}

describe('admin DataTable search', () => {
  it('matches every word, in any order, across hyphenated slugs', () => {
    render(<DataTable data={rows} columns={columns} searchKeys={['name', 'slug', 'gmapsPhone']} />)
    search('harley 111')
    expect(names()).toEqual([expect.stringContaining('111 Harley St')])
  })

  it('ignores booleans and keys outside searchKeys', () => {
    render(<DataTable data={rows} columns={columns} searchKeys={['name', 'slug']} />)
    search('fa') // "false"
    expect(names()).toEqual([expect.stringContaining('No results')])
  })

  it('still matches phone numbers typed without spaces', () => {
    render(<DataTable data={rows} columns={columns} searchKeys={['gmapsPhone']} />)
    search('02079460111')
    expect(names()).toEqual([expect.stringContaining('Abbey Clinic')])
  })

  it('orders rows by defaultSort (shared listing order) when no column sort is active', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        searchKeys={['name', 'slug', 'gmapsPhone']}
        defaultSort={(a, b) => compareClinicListingOrder(a, b)}
      />,
    )
    search('111')
    expect(names()).toEqual([
      expect.stringContaining('111 Harley St'),
      expect.stringContaining('Abbey Clinic'),
    ])
  })

  it('tokenizes like the public search', () => {
    expect(tokenizeSearch('  111-Harley_St ')).toEqual(['111', 'harley', 'st'])
  })
})

describe('compareClinicListingOrder', () => {
  it('puts Consentz first, then most reviews, then highest rating, then id', () => {
    const list = [
      { id: 1, slug: 'a', reviewCount: 10, rating: 5 },
      { id: 2, slug: 'b', reviewCount: 50, rating: 4 },
      { id: 3, slug: 'c', reviewCount: 50, rating: 4.8 },
      { id: 4, slug: '111-harley-st', reviewCount: 1, rating: 3 },
      { id: 5, slug: 'e', reviewCount: 10, rating: 5 },
      { id: 6, slug: 'f', reviewCount: null, rating: null },
    ]
    expect([...list].sort(compareClinicListingOrder).map((c) => c.id)).toEqual([4, 3, 2, 1, 5, 6])
  })
})
