import { z } from 'zod'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

export const initiateClinicClaimSchema = z.object({
  entityType: z.literal('clinic'),
  isNewRegistration: z.literal(false).optional(),
  clinicSlug: z.string().min(1),
  claimerName: z.string().trim().min(2, 'Please enter your full name.'),
  claimerEmail: z.string().trim().min(1, 'Business Email is required.').email('Please enter a valid email address.'),
  clinicNameInput: z.string().trim().min(1, 'Clinic Name is required.'),
  clinicPhone: z.string().trim().min(1, 'Phone Number is required.')
    .refine((v) => UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  clinicWebsite: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  googleBusinessLink: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
})

export const initiatePractitionerClaimSchema = z.object({
  entityType: z.literal('practitioner'),
  isNewRegistration: z.literal(false).optional(),
  practitionerSlug: z.string().min(1),
  claimerName: z.string().trim().min(2, 'Please enter your full name.'),
  claimerEmail: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email address.'),
  claimerPhone: z.string().trim().optional()
    .refine((v) => !v || UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  profession: z.string().trim().min(1, 'Profession is required.'),
  clinicNameInput: z.string().trim().optional(),
  licenseNumber: z.string().trim().optional(),
  registryName: z.string().trim().optional(),
})

// Register a brand-new business — no existing Clinic/Practitioner row to claim yet.
export const initiateClinicRegistrationSchema = z.object({
  entityType: z.literal('clinic'),
  isNewRegistration: z.literal(true),
  claimerName: z.string().trim().min(2, 'Please enter your full name.'),
  claimerEmail: z.string().trim().min(1, 'Business Email is required.').email('Please enter a valid email address.'),
  clinicNameInput: z.string().trim().min(1, 'Clinic Name is required.'),
  clinicPhone: z.string().trim().min(1, 'Phone Number is required.')
    .refine((v) => UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  clinicWebsite: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  googleBusinessLink: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required.'),
  city: z.string().trim().min(1, 'City is required.'),
  category: z.string().trim().optional(),
  about: z.string().trim().optional(),
})

export const initiatePractitionerRegistrationSchema = z.object({
  entityType: z.literal('practitioner'),
  isNewRegistration: z.literal(true),
  claimerName: z.string().trim().min(2, 'Please enter your full name.'),
  claimerEmail: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email address.'),
  claimerPhone: z.string().trim().optional()
    .refine((v) => !v || UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  profession: z.string().trim().min(1, 'Profession is required.'),
  clinicNameInput: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required.'),
  about: z.string().trim().optional(),
})

export const initiateClaimSchema = z.union([
  initiateClinicClaimSchema,
  initiatePractitionerClaimSchema,
  initiateClinicRegistrationSchema,
  initiatePractitionerRegistrationSchema,
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

export const consentzLinkSchema = z.object({
  token:                 z.string().min(1),
  consentzClinicId:      z.number().int().positive(),
  consentzUserId:        z.number().int().positive(),
  consentzUsername:      z.string().min(1),
  consentzSessionToken:  z.string().nullable().optional(),
  // HMAC-SHA256(DIRECTORY_LINK_SECRET, "{token}:{consentzClinicId}:{consentzUserId}")
  // Optional for backwards compat; verified when present; should become required once
  // ConsentzLive sends the field on every directoryLinkSubmit POST.
  sig:                   z.string().optional(),
})

export type InitiateClaimInput = z.infer<typeof initiateClaimSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type SelectPlanInput = z.infer<typeof selectPlanSchema>
export type AdminReviewClaimInput = z.infer<typeof adminReviewClaimSchema>
export type ConsentzLinkInput = z.infer<typeof consentzLinkSchema>
