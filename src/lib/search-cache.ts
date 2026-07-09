// Cross-request cache for the /search page's combined dataset (clinics, practitioners,
// products, treatments). React's cache() in src/app/actions/search.ts only dedupes within
// a single request — this is what actually avoids refetching on every filter change.
//
// Two tiers, same pattern as src/lib/json-cache.ts: an in-memory NodeCache (works even
// when REDIS_URL isn't set, e.g. local dev) backed by Redis so every PM2 worker shares
// a hit once one of them has populated it.
import NodeCache from 'node-cache'
import { getCache, setCache, delCache } from '@/lib/redis-cache'

const SEARCH_DATA_CACHE_KEY = 'search:load-data:v1'
const SEARCH_DATA_TTL_SECONDS = 3600

const memoryCache = new NodeCache({ stdTTL: SEARCH_DATA_TTL_SECONDS, useClones: false })

export async function getCachedSearchData<T>(): Promise<T | null> {
  const local = memoryCache.get<T>(SEARCH_DATA_CACHE_KEY)
  if (local !== undefined) return local

  const remote = await getCache<T>(SEARCH_DATA_CACHE_KEY)
  if (remote !== null) memoryCache.set(SEARCH_DATA_CACHE_KEY, remote)
  return remote
}

export async function setCachedSearchData(value: unknown): Promise<void> {
  memoryCache.set(SEARCH_DATA_CACHE_KEY, value)
  await setCache(SEARCH_DATA_CACHE_KEY, value, SEARCH_DATA_TTL_SECONDS)
}

export async function invalidateSearchCache(): Promise<void> {
  memoryCache.del(SEARCH_DATA_CACHE_KEY)
  await delCache(SEARCH_DATA_CACHE_KEY)
}
