const DEFAULT_BASE_URL = "https://staging.consentz.com"
const DEFAULT_BOOK_DEMO_BASE_URL = "https://www.consentz.com"
const CURRENT_BASE_PATH = "/directory"

export function b2bBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL
}

export function b2bBookDemoBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BOOK_DEMO_BASE_URL?.trim() ||
    DEFAULT_BOOK_DEMO_BASE_URL
  ).replace(/\/$/, "")
}

export function toCurrentSiteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${b2bBaseUrl()}${CURRENT_BASE_PATH}${normalizedPath}`
}

export function b2bBookDemoHref() {
  const base = b2bBookDemoBaseUrl()
  return `${base}/book-demo/?source=${encodeURIComponent(`${base}/`)}`
}

export function b2bOgImageUrl(candidates: string[] = []) {
  const firstImagePath = candidates[0] || "/images/Consentz Logo.webp"
  const normalizedPath = firstImagePath.startsWith("/")
    ? firstImagePath
    : `/${firstImagePath}`
  return encodeURI(`${b2bBaseUrl()}${CURRENT_BASE_PATH}${normalizedPath}`)
}
