// Lightweight fixed-window rate limiter. Uses Redis when REDIS_URL is set (shared across
// PM2 workers); falls back to a per-process in-memory window otherwise. There is no
// dedicated limiter elsewhere in the codebase — this is intentionally minimal and only
// used to blunt abuse of public, token-gated endpoints (e.g. review feedback submit).

import { incrCache } from '@/lib/redis-cache'

interface MemEntry {
  count: number
  resetAt: number
}

const memStore = new Map<string, MemEntry>()

function memIncr(key: string, windowSec: number): number {
  const now = Date.now()
  const existing = memStore.get(key)
  if (!existing || existing.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return 1
  }
  existing.count += 1
  return existing.count
}

// Opportunistic cleanup so the map can't grow unbounded on a long-lived worker.
function sweep() {
  if (memStore.size < 5000) return
  const now = Date.now()
  for (const [k, v] of memStore) if (v.resetAt <= now) memStore.delete(k)
}

export interface RateLimitResult {
  ok: boolean
  count: number
  limit: number
}

/**
 * @param key        caller-namespaced key, e.g. `fb:ip:<hash>`
 * @param limit      max requests allowed in the window
 * @param windowSec  window length in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  sweep()
  const redisCount = await incrCache(`rl:${key}`, windowSec)
  const count = redisCount ?? memIncr(key, windowSec)
  return { ok: count <= limit, count, limit }
}
