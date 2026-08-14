import { z } from "zod"

export const clinicSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case (lowercase letters, numbers, hyphens only)'),
  image: z.string().url('Image must be a valid URL'),
  url: z.string().url('URL must be a valid URL'),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
  reviewCount: z.number().int().min(0, 'Review count must be a non-negative integer'),
  category: z.string().min(1, 'Category is required'),
  gmapsAddress: z.string().min(1, 'Address is required'),
  gmapsPhone: z.string().optional(),
  gmapsReviews: z.array(z.object({
    reviewer_name: z.string().min(1),
    rating: z.string().min(1),
    date: z.string().min(1),
    review_text: z.string().optional(),
    owner_response: z.string().nullable()
  })).optional(),
  reviewAnalysis: z.any().optional(),
  weighted_analysis: z.any().optional(),
  City: z.string().min(1, 'City is required'),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  Linkedin: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isSaveFace: z.boolean(),
  isDoctor: z.boolean(),
  isJCCP: z.tuple([z.boolean(), z.string()]).nullable().optional(),
  isCQC: z.tuple([z.boolean(), z.string()]).nullable().optional(),
  isHIW: z.tuple([z.boolean(), z.string()]).nullable().optional(),
  isHIS: z.tuple([z.boolean(), z.string()]).nullable().optional(),
  isRQIA: z.tuple([z.boolean(), z.string()]).nullable().optional(),
  about_section: z.string().optional(),
  accreditations: z.string().optional(),
  awards: z.string().optional(),
  affiliations: z.string().optional(),
  hours: z.string().optional(),
  Practitioners: z.string().optional(),
  Insurace: z.string().optional(),
  Payments: z.string().optional(),
  Fees: z.string().optional(),
  x_twitter: z.string().optional(),
  Treatments: z.array(z.string()).optional()
})

export type ClinicInput = z.infer<typeof clinicSchema>

// max lengths mirror the @db.VarChar / @db.Text column widths in prisma/schema.prisma —
// keep in sync with the `Clinic` model so a save fails validation, not a Prisma P2000 500.
const TEXT_MAX = 65535

const maxStr = (max: number, label: string) =>
  z.string().max(max, `${label} must be ${max.toLocaleString()} characters or less`).optional().nullable()

// Admin edit schema — uses Prisma field names directly, all fields optional
export const clinicEditSchema = z.object({
  name: maxStr(255, 'Name'),
  image: maxStr(TEXT_MAX, 'Image'),
  gmapsUrl: maxStr(TEXT_MAX, 'Google Maps URL'),
  gmapsAddress: maxStr(500, 'Address'),
  gmapsPhone: maxStr(200, 'Phone'),
  category: maxStr(100, 'Category'),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().int().min(0).optional().nullable(),
  aboutSection: maxStr(TEXT_MAX, 'About section'),
  accreditations: maxStr(TEXT_MAX, 'Accreditations'),
  awards: maxStr(TEXT_MAX, 'Awards'),
  affiliations: maxStr(TEXT_MAX, 'Affiliations'),
  website: maxStr(500, 'Website'),
  email: maxStr(255, 'Email'),
  facebook: maxStr(500, 'Facebook'),
  twitter: maxStr(500, 'Twitter'),
  xTwitter: maxStr(500, 'X (Twitter)'),
  instagram: maxStr(500, 'Instagram'),
  youtube: maxStr(500, 'YouTube'),
  linkedin: maxStr(500, 'LinkedIn'),
  isSaveFace: z.boolean().optional(),
  isDoctor: z.boolean().optional(),
  isJccp: z.boolean().optional().nullable(),
  jccpUrl: maxStr(500, 'JCCP URL'),
  isCqc: z.boolean().optional().nullable(),
  cqcUrl: maxStr(500, 'CQC URL'),
  isHiw: z.boolean().optional().nullable(),
  hiwUrl: maxStr(500, 'HIW URL'),
  isHis: z.boolean().optional().nullable(),
  hisUrl: maxStr(500, 'HIS URL'),
  isRqia: z.boolean().optional().nullable(),
  rqiaUrl: maxStr(500, 'RQIA URL'),
  coverImage: maxStr(TEXT_MAX, 'Cover image'),
  cqcStatus: z.enum(['not_applicable', 'good', 'requires_improvement', 'outstanding']).optional().nullable(),
  avgReplyTime: z.enum(['within_24hrs', 'within_48hrs', 'more_than_48hrs']).optional().nullable(),
  coreClinicId: z.coerce.number().int().positive().optional().nullable(),
})

export type ClinicEditInput = z.infer<typeof clinicEditSchema>
