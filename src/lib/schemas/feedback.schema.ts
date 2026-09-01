import { z } from 'zod'

// Public review-feedback submission (token-gated, no auth).
export const feedbackSubmitSchema = z.object({
  rating: z.number().int().min(1, 'Please choose a rating').max(5),
  comment: z.string().trim().min(1, 'Please add a comment').max(5000),
  submitterName: z.string().trim().max(200).optional().nullable(),
  // Anti-bot fields — validated in the route, not surfaced to the user.
  company: z.string().optional(), // honeypot: must be empty
  dwell: z.string().optional(),
})

export type FeedbackSubmitInput = z.infer<typeof feedbackSubmitSchema>

// Portal: clinic generates a per-patient review link.
export const reviewRequestCreateSchema = z.object({
  patientName: z.string().trim().max(200).optional().nullable(),
  patientEmail: z.string().trim().email().max(255).optional().nullable().or(z.literal('')),
  sendEmail: z.boolean().optional(),
})

export type ReviewRequestCreateInput = z.infer<typeof reviewRequestCreateSchema>
