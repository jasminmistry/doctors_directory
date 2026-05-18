import type { HubTemplateLibraryFormat } from "@/lib/b2b-hub/hub-template-library-data"

export type MarketingTemplateSeed = {
  id: string
  title: string
  description: string
  format: Exclude<HubTemplateLibraryFormat, "all">
  tagPrimary: string
  tagSecondary?: string
}

const CAROUSEL_THEMES = [
  "Spring Skin Refresh",
  "Summer Glow Clinic",
  "Autumn Peel Season",
  "Winter Hydration",
  "New Patient Welcome",
  "Botox Tuesday Offer",
  "Filler Friday Spotlight",
  "Laser Hair Removal",
  "Microneedling Results",
  "Chemical Peel Education",
  "Profhilo Launch",
  "Skin Booster Series",
  "Med Spa Membership",
  "VIP Loyalty Club",
  "Refer A Friend",
  "Before And After",
  "Meet The Team",
  "Practitioner Spotlight",
  "CQC Ready Clinic",
  "Digital Consent Benefits",
  "Patch Test Reminder",
  "Aftercare Essentials",
  "Holiday Gift Cards",
  "Black Friday Aesthetics",
  "Valentine Lip Filler",
  "Mother's Day Package",
  "Men's Grooming Clinic",
  "Acne Treatment Pathway",
  "Pigmentation Solutions",
  "Rosacea Awareness",
  "Hair Restoration",
  "Wellness IV Lounge",
  "Longevity Programme",
  "Non-Surgical Facelift",
  "Thread Lift Intro",
  "Body Contouring",
  "Fat Dissolving Guide",
  "HIFU Skin Tightening",
  "Morpheus8 Education",
  "PRP Hair & Skin",
  "Polynucleotide Launch",
  "Lip Blush & PMU",
  "Lash & Brow Bar",
  "Tattoo Removal Offer",
  "Cryolipolysis Promo",
  "Hydrafacial Glow",
  "Dermaplaning Special",
  "LED Therapy Benefits",
  "SPF & Sun Safety",
  "Clinic Relaunch",
  "Five Star Reviews",
]

const REEL_THEMES = [
  "Treatment Room Tour",
  "Day In The Life",
  "Consultation Tips",
  "Consent Walkthrough",
  "Aftercare Reminder",
  "Patch Test Day",
  "Practitioner Intro",
  "Product Spotlight",
  "Patient Testimonial",
  "Myth Buster Monday",
  "Quick Peel Facts",
  "Filler Safety",
  "Botox Explained",
  "Laser Settings",
  "Skin Analysis",
  "Booking CTA",
  "Last Minute Offers",
  "Team Culture",
  "CQC Inspection Prep",
  "Digital Forms Demo",
  "WhatsApp Booking",
  "Membership Perks",
  "Gift Card Promo",
  "Seasonal Skincare",
  "Acne Journey",
  "Hair Loss Support",
  "Wellness Drip",
  "Men's Aesthetics",
  "Lip Filler Trends",
  "Body Confidence",
]

const STORY_THEMES = [
  "Poll: Next Treatment",
  "Q&A With Nurse",
  "Flash Offer 24h",
  "New Treatment Alert",
  "Clinic Hours Update",
  "Review Us",
  "Behind The Scenes",
  "Staff Pick Product",
]

const EMAIL_THEMES = [
  "New Patient Welcome",
  "Appointment Confirmation",
  "Patch Test Reminder",
  "Pre-Treatment Checklist",
  "Post-Treatment Aftercare",
  "Reactivation Win-Back",
  "Birthday Offer",
  "Membership Renewal",
  "Review Request",
  "Seasonal Promotion",
  "Referral Thank You",
  "No-Show Follow Up",
]

function buildSeeds(
  themes: string[],
  format: Exclude<HubTemplateLibraryFormat, "all">,
  prefix: string,
  tagPrimary: string,
  tagSecondary: string | undefined,
  titleSuffix: string
): MarketingTemplateSeed[] {
  return themes.map((theme, index) => ({
    id: `${prefix}-${index + 1}`,
    title: `${theme} ${titleSuffix}`,
    description: `${theme} — ready-to-edit ${format} template for UK aesthetic clinics. Open in Consentz Control to customise and publish.`,
    format,
    tagPrimary,
    tagSecondary,
  }))
}

export const MARKETING_TEMPLATE_SEEDS: MarketingTemplateSeed[] = [
  ...buildSeeds(CAROUSEL_THEMES, "carousels", "carousel", "CAROUSELS", "MARKETING", "Carousel Template"),
  ...buildSeeds(REEL_THEMES, "reels", "reel", "REELS", "SOCIAL", "Reel Template"),
  ...buildSeeds(STORY_THEMES, "stories", "story", "STORIES", "SOCIAL", "Story Template"),
  ...buildSeeds(EMAIL_THEMES, "email", "email", "EMAIL", "MARKETING", "Email Template"),
]
