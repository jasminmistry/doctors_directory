const DEFAULT_BASE_URL = "https://staging.consentz.com"

export function b2bBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL
}

export function b2bOgImageUrl() {
  return encodeURI(`${b2bBaseUrl()}/directory/images/Consentz Logo.webp`)
}
