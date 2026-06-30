/**
 * Performance utilities for the application.
 */

// Simple in-memory cache for Firestore reads
const cache = new Map<string, { data: unknown; expiry: number }>();
const DEFAULT_TTL = 60000; // 1 minute

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCache(key: string, data: unknown, ttl: number = DEFAULT_TTL): void {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

export function clearCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}

/**
 * Throttle function — limits execution to once per interval.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let lastCall = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return fn(...args);
    }
  }) as T;
}
