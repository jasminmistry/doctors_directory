import fs from 'fs'
import path from 'path'

import {
  NHS_REMOVED_CLINIC_SLUGS,
  filterRemovedClinics,
  isRemovedClinicSlug,
} from '../lib/directory-removals'

describe('NHS clinic listing removals', () => {
  it('treats every NHS slug as removed', () => {
    expect(NHS_REMOVED_CLINIC_SLUGS).toHaveLength(58)
    for (const slug of NHS_REMOVED_CLINIC_SLUGS) {
      expect(isRemovedClinicSlug(slug)).toBe(true)
    }
  })

  it('keeps unrelated clinics', () => {
    expect(isRemovedClinicSlug('hampton-aesthetic-clinic')).toBe(false)
    expect(
      filterRemovedClinics([{ slug: 'derriford-hospital-dermatology' }, { slug: 'hampton-aesthetic-clinic' }])
    ).toEqual([{ slug: 'hampton-aesthetic-clinic' }])
  })

  it('has no NHS listings left in the clinics JSON', () => {
    const file = path.join(process.cwd(), 'public', 'clinics_processed_new_data.json')
    const clinics = JSON.parse(fs.readFileSync(file, 'utf8')) as Array<{ slug: string }>
    const nhsSlugs = new Set(NHS_REMOVED_CLINIC_SLUGS)
    expect(clinics.filter((clinic) => nhsSlugs.has(clinic.slug))).toEqual([])
  })
})
