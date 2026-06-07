import {
  resolveTreatmentHubSlug,
  treatmentMatchesHubSlug,
} from '@/lib/treatment-hub-registry'

export { normalizeTreatmentToken } from '@/lib/treatment-token'

export const treatmentMatchesSlug = (
  treatments: string[] | undefined,
  treatmentSlug: string
): boolean => treatmentMatchesHubSlug(treatments, resolveTreatmentHubSlug(treatmentSlug))
