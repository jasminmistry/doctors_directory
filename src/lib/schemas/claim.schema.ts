import { z } from 'zod'
import { EMAIL_RE } from '@/lib/email-validation'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

// Strips all internal whitespace (e.g. "+4 4 2 0 79 46 095 8") before validating and
// storing, so the persisted number is always a clean, dialable string.
function ukPhoneSchema(requiredError: string) {
  return z.string().trim()
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(z.string().min(1, requiredError).regex(UK_PHONE_RE, 'Please enter a valid UK phone number.'))
}

function optionalUkPhoneSchema() {
  return z.string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v.trim().replace(/\s/g, '')))
    .refine((v) => !v || UK_PHONE_RE.test(v), 'Please enter a valid UK phone number.')
}

// A single absolute URL with no embedded whitespace — rejects "url1 url2", tab/newline-joined
// URLs, and whitespace-only input, while still trimming and allowing a genuinely blank field.
function singleUrlSchema(label: string) {
  return z.string().trim()
    .max(500, `${label} cannot exceed 500 characters.`)
    .regex(/^\S+$/, 'Enter a single valid URL with no spaces.')
    .url('Enter a valid URL')
    .optional()
    .or(z.literal(''))
}

export const initiateClinicClaimSchema = z.object({
  entityType: z.literal('clinic'),
  isNewRegistration: z.literal(false).optional(),
  clinicSlug: z.string().min(1),
  claimerName: z.string().trim().min(2, 'Please enter your full name.').max(255, 'Full Name cannot exceed 255 characters.'),
  claimerEmail: z.string().trim().min(1, 'Business Email is required.').regex(EMAIL_RE, 'Please enter a valid email address.').max(255, 'Email cannot exceed 255 characters.'),
  clinicNameInput: z.string().trim().min(1, 'Clinic Name is required.').max(255, 'Clinic Name cannot exceed 255 characters.'),
  clinicPhone: ukPhoneSchema('Phone Number is required.'),
  clinicWebsite: singleUrlSchema('Website URL'),
  googleBusinessLink: singleUrlSchema('Google Business link'),
})

export const initiatePractitionerClaimSchema = z.object({
  entityType: z.literal('practitioner'),
  isNewRegistration: z.literal(false).optional(),
  practitionerSlug: z.string().min(1),
  claimerName: z.string().trim().min(2, 'Please enter your full name.').max(255, 'Full Name cannot exceed 255 characters.'),
  claimerEmail: z.string().trim().min(1, 'Email is required.').regex(EMAIL_RE, 'Please enter a valid email address.').max(255, 'Email cannot exceed 255 characters.'),
  claimerPhone: optionalUkPhoneSchema(),
  profession: z.string().trim().min(1, 'Profession is required.').max(255, 'Profession cannot exceed 255 characters.'),
  clinicNameInput: z.string().trim().max(255, 'Clinic Name cannot exceed 255 characters.').optional(),
  licenseNumber: z.string().trim().max(100, 'Licence number cannot exceed 100 characters.').optional(),
  registryName: z.string().trim().max(255, 'Registry name cannot exceed 255 characters.').optional(),
})

// Register a brand-new business — no existing Clinic/Practitioner row to claim yet.
export const initiateClinicRegistrationSchema = z.object({
  entityType: z.literal('clinic'),
  isNewRegistration: z.literal(true),
  claimerName: z.string().trim().min(2, 'Please enter your full name.').max(255, 'Full Name cannot exceed 255 characters.'),
  claimerEmail: z.string().trim().min(1, 'Business Email is required.').regex(EMAIL_RE, 'Please enter a valid email address.').max(255, 'Email cannot exceed 255 characters.'),
  clinicNameInput: z.string().trim().min(1, 'Clinic Name is required.').max(255, 'Clinic Name cannot exceed 255 characters.'),
  clinicPhone: ukPhoneSchema('Phone Number is required.'),
  clinicWebsite: singleUrlSchema('Website URL'),
  googleBusinessLink: singleUrlSchema('Google Business link'),
  address: z.string().trim().min(1, 'Address is required.').max(500, 'Address cannot exceed 500 characters.'),
  city: z.string().trim().min(1, 'City is required.').max(255, 'City cannot exceed 255 characters.'),
  category: z.string().trim().max(255, 'Category cannot exceed 255 characters.').optional(),
  about: z.string().trim().optional(),
})

export const initiatePractitionerRegistrationSchema = z.object({
  entityType: z.literal('practitioner'),
  isNewRegistration: z.literal(true),
  claimerName: z.string().trim().min(2, 'Please enter your full name.').max(255, 'Full Name cannot exceed 255 characters.'),
  claimerEmail: z.string().trim().min(1, 'Email is required.').regex(EMAIL_RE, 'Please enter a valid email address.').max(255, 'Email cannot exceed 255 characters.'),
  claimerPhone: optionalUkPhoneSchema(),
  profession: z.string().trim().min(1, 'Profession is required.').max(255, 'Profession cannot exceed 255 characters.'),
  clinicNameInput: z.string().trim().max(255, 'Clinic Name cannot exceed 255 characters.').optional(),
  city: z.string().trim().min(1, 'City is required.').max(255, 'City cannot exceed 255 characters.'),
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

export const resendOtpSchema = z.object({
  claimId: z.number().int().positive(),
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
