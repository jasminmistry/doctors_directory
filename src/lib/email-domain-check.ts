import { resolveMx } from 'dns/promises'

/** Server-only: confirms the email's domain has a mail server, catching typo domains (e.g. gmial.com). */
export async function domainHasMailServer(email: string): Promise<boolean> {
  const domain = email.split('@')[1]
  if (!domain) return false

  try {
    const records = await resolveMx(domain)
    return records.length > 0
  } catch {
    return false
  }
}
