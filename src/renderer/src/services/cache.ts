const TTL_MS = 10 * 60 * 1000

interface CacheEntry {
  value: unknown
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

export function clearCache(): void {
  cache.clear()
}

export function cacheSize(): number {
  return cache.size
}

export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number = TTL_MS
): Promise<T> {
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.value as T
  }

  const value = await loader()
  cache.set(key, { value, expiresAt: now + ttlMs })
  return value
}
