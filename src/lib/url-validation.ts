/** True for a single absolute URL with no embedded whitespace — rejects "url1 url2", tab/newline-joined URLs, and whitespace-only input. */
export function isValidSingleUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return false
  try {
    new URL(trimmed)
    return true
  } catch {
    return false
  }
}
