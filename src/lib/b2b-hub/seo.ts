const DEFAULT_BASE_URL = "https://staging.consentz.com"
const CURRENT_BASE_PATH = "/directory"

export function b2bBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL
}

export function toCurrentSiteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${b2bBaseUrl()}${CURRENT_BASE_PATH}${normalizedPath}`
}

export function b2bOgImageUrl(candidates: string[] = []) {
  const firstImagePath = candidates[0] || "/images/Consentz Logo.webp"
  const normalizedPath = firstImagePath.startsWith("/")
    ? firstImagePath
    : `/${firstImagePath}`
  return encodeURI(`${b2bBaseUrl()}${CURRENT_BASE_PATH}${normalizedPath}`)
}
