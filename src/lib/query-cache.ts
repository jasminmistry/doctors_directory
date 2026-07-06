// Shared read-through cache for Prisma-backed data-access functions.
//
// Two layers:
//   L1 — in-process NodeCache, short TTL. Avoids a Redis round-trip on every
//        request handled by the same PM2 worker.
//   L2 — Redis (via @/lib/redis-cache), longer TTL, shared across workers.
//        No-ops gracefully if REDIS_URL isn't set (falls straight through to `fn`).
//
// Invalidation is best-effort: admin write routes call invalidateQueryCache()
// for the keys they know are affected, and the short TTLs self-heal anything
// missed within a few minutes.
import NodeCache from 'node-cache'
import { getCache, setCache, delCache } from '@/lib/redis-cache'

const MEM_TTL_SECONDS = 60
const REDIS_TTL_SECONDS = 300

const memCache = new NodeCache({ stdTTL: MEM_TTL_SECONDS, useClones: false })

export async function withQueryCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const mem = memCache.get<T>(key)
  if (mem !== undefined) return mem

  const fromRedis = await getCache<T>(key)
  if (fromRedis !== null) {
    memCache.set(key, fromRedis)
    return fromRedis
  }

  const fresh = await fn()
  memCache.set(key, fresh)
  void setCache(key, fresh, REDIS_TTL_SECONDS)
  return fresh
}

export function invalidateQueryCache(...keys: string[]): void {
  for (const key of keys) {
    memCache.del(key)
    void delCache(key)
  }
}
