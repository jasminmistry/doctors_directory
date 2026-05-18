import crypto from 'crypto'
export { isGenericEmailDomain } from './email-domains'

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999))
}

export function otpExpiresAt(): Date {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 10)
  return d
}

export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function isDomainMatch(email: string, website: string): boolean {
  try {
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!emailDomain) return false
    const site = website.startsWith('http') ? website : `https://${website}`
    const siteDomain = new URL(site).hostname.replace(/^www\./, '')
    return emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`)
  } catch {
    return false
  }
}

export const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pay_per_lead: 'Pay-Per-Lead',
  subscription: 'Subscription',
}

export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pay_per_lead: 15,
  subscription: 99,
}
