export type DirectoryPageType =
  | "practitioner_page"
  | "clinic_page"
  | "collection_page"
  | "other"

export interface CtaClickPayload {
  timestamp: string
  pageUrl: string
  pageType: DirectoryPageType
  referrer: string
  ctaLabel: string
  ctaTargetUrl?: string
}

export interface LeadPayload {
  timestamp: string
  pageUrl: string
  pageType: DirectoryPageType
  referrer: string
  name: string
  contact: string
  treatment?: string
  location?: string
  budget?: string
}
