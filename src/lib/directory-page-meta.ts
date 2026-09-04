import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'

type MetaEntry = {
  t: string
  d: string
  k: string
}

export type DirectoryPageMeta = {
  title?: string
  description?: string
  keywords?: string
}

const metaCache = new NodeCache({ stdTTL: 0, useClones: false })
const META_DIR = path.join(process.cwd(), 'src/lib/data/directory-page-metas')

export const DIRECTORY_PAGE_META_BUCKETS = [
  'clinic_city_x_treatment.json',
  'practitioner_city_x_treatment.json',
  'clinic_city.json',
  'practitioner_city.json',
  'national_treatment.json',
  'service_category_city.json',
  'product_category.json',
  'product_brand.json',
] as const

function loadBucket(filename: string): Record<string, MetaEntry> {
  const cacheKey = `directory-page-meta:${filename}`
  const cached = metaCache.get<Record<string, MetaEntry>>(cacheKey)
  if (cached) return cached

  const filePath = path.join(META_DIR, filename)
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`[directory-page-meta] Missing meta bucket: ${filePath}`)
      metaCache.set(cacheKey, {})
      return {}
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<
      string,
      MetaEntry
    >
    metaCache.set(cacheKey, parsed)
    return parsed
  } catch (error) {
    console.error(
      `[directory-page-meta] Failed to load meta bucket ${filename}:`,
      error
    )
    metaCache.set(cacheKey, {})
    return {}
  }
}

export function normalizeDirectoryMetaPath(pathname: string): string {
  let normalized = pathname.trim()
  if (normalized.startsWith('/directory/')) {
    normalized = normalized.slice('/directory'.length)
  }
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }
  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`
  }
  return normalized
}

function bucketForPath(pathname: string): string | null {
  if (/^\/clinics\/[^/]+\/services\/[^/]+\/$/.test(pathname)) {
    return 'clinic_city_x_treatment.json'
  }
  if (/^\/practitioners\/[^/]+\/treatments\/[^/]+\/$/.test(pathname)) {
    return 'practitioner_city_x_treatment.json'
  }
  if (/^\/clinics\/[^/]+\/$/.test(pathname)) {
    return 'clinic_city.json'
  }
  if (/^\/practitioners\/[^/]+\/$/.test(pathname)) {
    return 'practitioner_city.json'
  }
  if (/^\/treatments\/[^/]+\/$/.test(pathname)) {
    return 'national_treatment.json'
  }
  if (/^\/products\/category\/[^/]+\/$/.test(pathname)) {
    return 'product_category.json'
  }
  if (/^\/products\/brands\/[^/]+\/$/.test(pathname)) {
    return 'product_brand.json'
  }
  if (
    /^\/[^/]+\/[^/]+\/$/.test(pathname) &&
    !pathname.startsWith('/clinics/') &&
    !pathname.startsWith('/practitioners/') &&
    !pathname.startsWith('/products/') &&
    !pathname.startsWith('/treatments/') &&
    !pathname.startsWith('/business/') &&
    !pathname.startsWith('/accredited/') &&
    !pathname.startsWith('/admin/') &&
    !pathname.startsWith('/portal/')
  ) {
    return 'service_category_city.json'
  }
  return null
}

export function getDirectoryPageMeta(pathname: string): DirectoryPageMeta | null {
  const normalized = normalizeDirectoryMetaPath(pathname)
  const filename = bucketForPath(normalized)
  if (!filename) return null

  const bucket = loadBucket(filename)
  const entry = bucket[normalized]
  if (!entry) return null

  return {
    title: entry.t || undefined,
    description: entry.d || undefined,
    keywords: entry.k || undefined,
  }
}

export function resolveDirectoryPageMeta(
  pathname: string,
  fallback: { title: string; description: string; keywords?: string }
): { title: string; description: string; keywords?: string } {
  const meta = getDirectoryPageMeta(pathname)
  if (!meta) return fallback

  return {
    title: meta.title || fallback.title,
    description: meta.description || fallback.description,
    keywords: meta.keywords || fallback.keywords,
  }
}

export function listDirectoryPageMetaPaths(): string[] {
  const paths = new Set<string>()
  for (const filename of DIRECTORY_PAGE_META_BUCKETS) {
    for (const pathname of Object.keys(loadBucket(filename))) {
      paths.add(normalizeDirectoryMetaPath(pathname))
    }
  }
  return [...paths]
}
