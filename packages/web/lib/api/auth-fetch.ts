'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fleetos_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // If API_BASE points to the current web host, route via Next.js proxy (/api/...)
  const isSameHost = typeof window !== 'undefined' && API_BASE ? (() => {
    try {
      const u = new URL(API_BASE, window.location.origin);
      return u.host === window.location.host;
    } catch {
      return false;
    }
  })() : false;

  const effectiveBase = isSameHost ? '' : API_BASE;
  const apiPath = effectiveBase && path.startsWith('/api') ? path.slice(4) : path;
  const url = effectiveBase ? `${effectiveBase}${apiPath}` : path;
  const doFetch = () => fetch(url, { ...options, headers });

  const method = (options.method ?? 'GET').toUpperCase();
  if (method !== 'GET') return doFetch();

  // GETs are safe to retry once for transient 5xx with a fast backoff
  try {
    const res = await doFetch();
    if (res.status >= 500) {
      await new Promise((r) => setTimeout(r, 150));
      return doFetch();
    }
    return res;
  } catch {
    await new Promise((r) => setTimeout(r, 150));
    return doFetch();
  }
}
