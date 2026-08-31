import {
  getDirectoryPageMeta,
  normalizeDirectoryMetaPath,
  resolveDirectoryPageMeta,
} from '@/lib/directory-page-meta'

describe('directory page meta lookup', () => {
  it('normalizes paths with and without trailing slash', () => {
    expect(normalizeDirectoryMetaPath('/clinics/london/services/botox')).toBe(
      '/clinics/london/services/botox/'
    )
    expect(normalizeDirectoryMetaPath('/directory/clinics/london/')).toBe(
      '/clinics/london/'
    )
  })

  it('loads Moiz meta for clinic city treatment pages', () => {
    const meta = getDirectoryPageMeta(
      '/clinics/aberaeron/services/aesthetic-skin-consultation/'
    )
    expect(meta?.title).toBe(
      'Aesthetic Skin Consultation Clinics in Aberaeron | Consentz'
    )
    expect(meta?.description).toContain('Aberaeron')
    expect(meta?.keywords).toContain('Aberaeron')
  })

  it('falls back when path is missing', () => {
    const meta = resolveDirectoryPageMeta('/clinics/not-a-real-city-xyz/', {
      title: 'Fallback Title',
      description: 'Fallback Description',
    })
    expect(meta).toEqual({
      title: 'Fallback Title',
      description: 'Fallback Description',
      keywords: undefined,
    })
  })
})
