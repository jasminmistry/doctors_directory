import { z } from 'zod'

export const initiateClinicClaimSchema = z.object({
  entityType: z.literal('clinic'),
  clinicSlug: z.string().min(1),
  claimerName: z.string().min(2, 'Full name is required'),
  claimerEmail: z.string().email('Valid email is required'),
  clinicNameInput: z.string().min(1, 'Clinic name is required'),
  clinicPhone: z.string().min(1, 'Phone number is required'),
  clinicWebsite: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  googleBusinessLink: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

export const initiatePractitionerClaimSchema = z.object({
  entityType: z.literal('practitioner'),
  practitionerSlug: z.string().min(1),
  claimerName: z.string().min(2, 'Full name is required'),
  claimerEmail: z.string().email('Valid email is required'),
  claimerPhone: z.string().optional(),
  profession: z.string().min(1, 'Profession is required'),
  clinicNameInput: z.string().optional(),
  licenseNumber: z.string().optional(),
  registryName: z.string().optional(),
})

export const initiateClaimSchema = z.discriminatedUnion('entityType', [
  initiateClinicClaimSchema,
  initiatePractitionerClaimSchema,
])

export const verifyOtpSchema = z.object({
  claimId: z.number().int().positive(),
  otp: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
})

export const selectPlanSchema = z.object({
  claimId: z.number().int().positive(),
  plan: z.enum(['free', 'pay_per_lead', 'subscription']),
})

export const adminReviewClaimSchema = z.object({
  action: z.enum(['approve', 'reject', 'mark_paid', 'reprovision']),
  adminNotes: z.string().optional(),
})

export type InitiateClaimInput = z.infer<typeof initiateClaimSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type SelectPlanInput = z.infer<typeof selectPlanSchema>
export type AdminReviewClaimInput = z.infer<typeof adminReviewClaimSchema>
