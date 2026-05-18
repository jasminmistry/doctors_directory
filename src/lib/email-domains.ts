const GENERIC_EXACT = new Set([
  'gmail.com', 'googlemail.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'tutanota.com', 'tuta.io',
  'zohomail.com',
  'mail.com', 'email.com',
])

// Prefixes where any TLD counts (yahoo.com, yahoo.co.uk, yahoo.co.in, etc.)
const GENERIC_PREFIX = ['yahoo.', 'hotmail.', 'outlook.', 'live.', 'msn.', 'ymail.']

export function isGenericEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  if (!domain) return false
  if (GENERIC_EXACT.has(domain)) return true
  return GENERIC_PREFIX.some((prefix) => domain.startsWith(prefix))
}
