'use client';

import { authFetch } from './auth-fetch';

const ENVELOPE_KEYS = ['data', 'items', 'rows', 'machines', 'sessions', 'alerts', 'operators', 'clients', 'accounts', 'categories'];

/**
 * In-memory client-side cache and deduplication maps for instantaneous
 * page navigation across Fleet OS modules.
 */
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

const listCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL_MS = 20000; // 20 seconds cache TTL for snappy tab switching

/** Clear all or matching cached entries when mutations occur. */
export function invalidateListCache(pattern?: string): void {
  if (!pattern) {
    listCache.clear();
    return;
  }
  for (const key of listCache.keys()) {
    if (key.includes(pattern)) {
      listCache.delete(key);
    }
  }
}

/** Check if cached data exists for synchronous initial render. */
export function getCachedList<T>(path: string): T[] | null {
  const entry = listCache.get(path);
  if (entry && Date.now() - entry.timestamp < DEFAULT_CACHE_TTL_MS) {
    return entry.data as T[];
  }
  return null;
}

/**
 * Normalize an API payload to an array. The API returns bare arrays on
 * success but objects on errors (RFC 7807, proxy 502) or envelopes
 * ({data, items, ...}). Never throws; falls back to [].
 */
export function toArray<T>(v: unknown, keys: string[] = ENVELOPE_KEYS): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const k of keys) {
      if (Array.isArray(o[k])) return o[k] as T[];
    }
  }
  return [];
}

/** GET a list endpoint; returns [] on non-ok / bad JSON / envelope. */
export async function fetchList<T>(path: string, options: RequestInit = {}): Promise<T[]> {
  const method = (options.method ?? 'GET').toUpperCase();
  const bypassCache = options.cache === 'no-store' || method !== 'GET';

  if (!bypassCache) {
    const cached = listCache.get(path);
    if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL_MS) {
      return cached.data as T[];
    }
    // Deduplicate in-flight requests for the exact same path
    if (inFlightRequests.has(path)) {
      return inFlightRequests.get(path) as Promise<T[]>;
    }
  }

  const fetchPromise = (async () => {
    try {
      const res = await authFetch(path, options);
      if (!res.ok) return [];
      try {
        const data = toArray<T>(await res.json());
        if (!bypassCache) {
          listCache.set(path, { data, timestamp: Date.now() });
        }
        return data;
      } catch {
        return [];
      }
    } catch {
      return [];
    } finally {
      inFlightRequests.delete(path);
    }
  })();

  if (!bypassCache) {
    inFlightRequests.set(path, fetchPromise);
  }

  return fetchPromise as Promise<T[]>;
}

/**
 * HTTP error that carries the response status so callers can tell auth
 * failures (401 → session expired) apart from outages (network / 5xx).
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, path: string) {
    super(`API ${status} on ${path}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Strict variant: THROWS on HTTP error or network failure so callers can
 * distinguish "API is down" (catch → show error banner) from
 * "API is up but database is empty" (empty array → show empty state).
 */
export async function fetchListStrict<T>(path: string, options: RequestInit = {}): Promise<T[]> {
  const method = (options.method ?? 'GET').toUpperCase();
  const bypassCache = options.cache === 'no-store' || method !== 'GET';

  if (!bypassCache) {
    const cached = listCache.get(path);
    if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL_MS) {
      return cached.data as T[];
    }
    if (inFlightRequests.has(path)) {
      return inFlightRequests.get(path) as Promise<T[]>;
    }
  }

  const fetchPromise = (async () => {
    try {
      const res = await authFetch(path, options);
      if (!res.ok) {
        throw new ApiError(res.status, path);
      }
      const data = toArray<T>(await res.json());
      if (!bypassCache) {
        listCache.set(path, { data, timestamp: Date.now() });
      }
      return data;
    } finally {
      inFlightRequests.delete(path);
    }
  })();

  if (!bypassCache) {
    inFlightRequests.set(path, fetchPromise);
  }

  return fetchPromise as Promise<T[]>;
}
