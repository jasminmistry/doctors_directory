import { Clinic, Practitioner } from '@/lib/types'
import { readJsonFileSync } from '@/lib/json-cache'
import { getAllPractitionersForSearch } from '@/lib/data-access/practitioners'

export const ACCREDITATION_KEYS = [
  'cqc',
  'jccp',
  'hiw',
  'his',
  'rqia',
  'saveface',
] as const

export type AccreditationKey = (typeof ACCREDITATION_KEYS)[number]

const ACCREDITATION_FIELD_MAP: Record<AccreditationKey, keyof Clinic> = {
  cqc: 'isCQC',
  jccp: 'isJCCP',
  hiw: 'isHIW',
  his: 'isHIS',
  rqia: 'isRQIA',
  saveface: 'isSaveFace',
}

export const getClinics = (): Clinic[] => readJsonFileSync('clinics_processed_new_data.json')

export const getPractitioners = (): Practitioner[] => readJsonFileSync('derms_processed_new_5403.json')

export const getPractitionersFromDb = (): Promise<Practitioner[]> =>
  getAllPractitionersForSearch()

export const getEnrichedPractitionersFromDb = async (): Promise<Array<Clinic & Practitioner>> => {
  const practitioners = await getAllPractitionersForSearch()
  return practitioners as unknown as Array<Clinic & Practitioner>
}

const parsePrimaryAssociatedClinic = (
  associatedClinics: Practitioner['Associated_Clinics']
): string | null => {
  if (!associatedClinics) return null

  if (Array.isArray(associatedClinics)) {
    return typeof associatedClinics[0] === 'string' ? associatedClinics[0] : null
  }

  if (typeof associatedClinics !== 'string') return null

  try {
    const parsed = JSON.parse(associatedClinics)
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0]
    }
  } catch {
    return associatedClinics
  }

  return null
}

export const hasAccreditation = (
  source: Clinic | Practitioner,
  accreditation: AccreditationKey
): boolean => {
  const field = ACCREDITATION_FIELD_MAP[accreditation]
  const value = source[field]
  if (value === true) return true
  if (Array.isArray(value)) return value[0] === true
  return false
}

export const hasAccreditationArrayFlag = (
  source: Clinic | Practitioner,
  accreditation: AccreditationKey
): boolean => {
  const field = ACCREDITATION_FIELD_MAP[accreditation]
  const value = source[field]
  return Array.isArray(value) && value[0] === true
}

export const normalizeCredentialToken = (value: string): string => {
  try {
    return decodeURIComponent(value).toLowerCase().replaceAll(/[\s-]/g, '')
  } catch {
    return value.toLowerCase().replaceAll(/[\s-]/g, '')
  }
}

const mergePractitionerWithClinic = (
  clinic: Clinic,
  practitioner: Practitioner
): Clinic & Practitioner => {
  const merged: Clinic & Practitioner = { ...clinic }

  for (const [key, value] of Object.entries(practitioner)) {
    if (value !== null && value !== undefined) {
      ;(merged as unknown as Record<string, unknown>)[key] = value
    }
  }

  // Practitioner records currently carry null treatment arrays, while the
  // treatment routes render against clinic-level offerings.
  merged.City = clinic.City
  merged.Treatments = clinic.Treatments

  return merged
}

export const getEnrichedPractitioners = (): Array<Clinic & Practitioner> => {
  const clinics = getClinics().filter((clinic) => Boolean(clinic.slug))
  const clinicIndex = new Map(clinics.map((clinic) => [clinic.slug as string, clinic]))

  return getPractitioners()
    .map((practitioner) => {
      const primaryClinicSlug = parsePrimaryAssociatedClinic(
        practitioner.Associated_Clinics
      )
      if (!primaryClinicSlug) return null

      const clinic = clinicIndex.get(primaryClinicSlug)
      if (!clinic) return null

      return mergePractitionerWithClinic(clinic, practitioner)
    })
    .filter((entry): entry is Clinic & Practitioner => entry !== null)
}
