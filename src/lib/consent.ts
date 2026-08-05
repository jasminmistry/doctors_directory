// Bump this whenever the wording below changes, so historical PatientConsent
// rows stay interpretable even after the live copy has moved on.
export const CONSENT_FORM_VERSION = 'v1'

export function consentDisclaimer(clinicName: string): string {
  return `Consentz runs this directory and will pass your details, including any health information in your enquiry, to ${clinicName} so they can contact you. Consentz controls this data until it reaches the clinic. Withdraw anytime at privacy@consentz.com.`
}

export interface ConsentCheckboxWording {
  share: string
  privacy: string
  age: string
}

export function consentCheckboxWording(clinicName: string): ConsentCheckboxWording {
  return {
    share: `I explicitly consent to Consentz sharing my enquiry, including any health or treatment information I provide, with ${clinicName} so they can contact me by phone, email or SMS about my enquiry.`,
    privacy: 'I have read and agree to the Privacy Policy, which explains how Consentz uses my information and how I can withdraw my consent.',
    age: 'I confirm I am 18 or over, or I am the parent or legal guardian of the person named above.',
  }
}
