// src/lib/redis-cache.ts
// Redis cache utility — gracefully disabled when REDIS_URL is not set.
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (!redisUrl) return null
  if (!_redis) {
    _redis = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    })
    _redis.on('error', (err) => {
      console.warn('[redis-cache] error:', err.message)
    })
  }
  return _redis
}

export async function getCache<T = any>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  try {
    const data = await client.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export async function setCache(key: string, value: any, ttlSeconds = 3600): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch (err: any) {
    console.warn('[redis-cache] setCache failed:', err.message)
  }
}

export async function delCache(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.del(key)
  } catch (err: any) {
    console.warn('[redis-cache] delCache failed:', err.message)
  }
}
