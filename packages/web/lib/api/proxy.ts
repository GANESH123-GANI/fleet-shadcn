import { NextRequest, NextResponse } from 'next/server';
import { handleMockApiRequest } from '@/lib/db/mock-db';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const FORCE_MOCK = process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.USE_MOCK_DB === 'true';

// Circuit breaker state to prevent cascading timeouts when upstream API is offline
let upstreamAlive: boolean | null = null;
let lastProbeTime = 0;
const PROBE_DOWN_INTERVAL = 15000; // When offline, back off for 15s before attempting again
const PROBE_UP_INTERVAL = 30000;   // When online, re-verify every 30s
let probePromise: Promise<boolean> | null = null;

async function checkUpstreamHealth(baseApiUrl: string): Promise<boolean> {
  const now = Date.now();
  if (upstreamAlive === false && now - lastProbeTime < PROBE_DOWN_INTERVAL) {
    return false;
  }
  if (upstreamAlive === true && now - lastProbeTime < PROBE_UP_INTERVAL) {
    return true;
  }
  if (probePromise) {
    return probePromise;
  }

  probePromise = (async () => {
    try {
      const parsed = new URL(baseApiUrl);
      const healthUrl = new URL('/v1/health', parsed);
      const res = await fetch(healthUrl.toString(), {
        method: 'GET',
        signal: AbortSignal.timeout(350), // Rapid 350ms probe
      });
      upstreamAlive = res.ok;
    } catch {
      upstreamAlive = false;
    } finally {
      lastProbeTime = Date.now();
      probePromise = null;
    }
    return upstreamAlive;
  })();

  return probePromise;
}

export async function proxy(request: NextRequest, path: string) {
  // Path traversal and SSRF protection: reject directory traversal attempts and control characters
  const cleanPath = path.replace(/\\/g, '/');
  if (cleanPath.includes('..') || cleanPath.includes('\0')) {
    return NextResponse.json({ detail: 'Invalid request path' }, { status: 400 });
  }

  // If explicitly configured to use mock database, bypass upstream API
  if (FORCE_MOCK) {
    return handleMockApiRequest(request, cleanPath);
  }

  const url = new URL(request.url);
  const reqHost = request.headers.get('host') || url.host;
  const reqPort = url.port || (url.protocol === 'https:' ? '443' : '80');
  const [reqHostname, hostPort] = reqHost.split(':');
  const effectiveReqPort = hostPort || reqPort;

  let apiUrl: URL;
  try {
    apiUrl = new URL(`${API_URL}${cleanPath}${url.search}`);
  } catch {
    return handleMockApiRequest(request, cleanPath);
  }

  // Self-loop protection: if API_URL points to this exact Next.js dev server,
  // NEVER forward to self — serve instantly from the in-memory mock database!
  const isLocal = (h: string) => h === 'localhost' || h === '127.0.0.1' || h === '::1';
  const apiPort = apiUrl.port || (apiUrl.protocol === 'https:' ? '443' : '80');
  const isSelfTarget =
    apiUrl.host === reqHost ||
    (isLocal(apiUrl.hostname) && isLocal(reqHostname) && apiPort === effectiveReqPort);

  if (isSelfTarget) {
    return handleMockApiRequest(request, cleanPath);
  }

  // Circuit breaker: check if upstream is reachable without blocking on every request
  const isReachable = await checkUpstreamHealth(API_URL);
  if (!isReachable) {
    return handleMockApiRequest(request, cleanPath);
  }

  // Forward headers (except host + conditionals). Conditional headers are
  // stripped because a 304 from upstream cannot carry a body, and the API
  // must always return full fresh data — forwarding them made warm-browser
  // revalidation crash the proxy into a 502.
  const STRIP_REQUEST = new Set(['host', 'if-none-match', 'if-modified-since', 'if-range']);
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Get request body if present
  let body: BodyInit | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(apiUrl.toString(), {
      method: request.method,
      headers,
      body,
      signal: AbortSignal.timeout(2000),
    });

    const contentType = response.headers.get('content-type') || '';
    // If upstream is not a valid JSON API (e.g. another local dev server returning HTML),
    // or if the upstream returns 404 or 5xx, fall back to our mock database.
    if (contentType.includes('text/html') || response.status === 404 || response.status >= 500) {
      upstreamAlive = false;
      lastProbeTime = Date.now();
      return await handleMockApiRequest(request, path);
    }

    // Forward response. Validators are dropped and caching disabled so the
    // browser never stores/revalidates API responses (fresh data only).
    const responseHeaders = new Headers();
    const STRIP_RESPONSE = new Set([
      'transfer-encoding',
      'content-encoding',
      'etag',
      'last-modified',
      'cache-control',
      'expires',
      'vary',
    ]);
    response.headers.forEach((value, key) => {
      if (!STRIP_RESPONSE.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    responseHeaders.set('cache-control', 'no-store');

    const responseBody = await response.arrayBuffer();

    // 204/205/304 are null-body statuses — passing a body throws a TypeError
    const NULL_BODY = new Set([204, 205, 304]);
    return new NextResponse(
      NULL_BODY.has(response.status) ? null : responseBody,
      {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    upstreamAlive = false;
    lastProbeTime = Date.now();
    try {
      return await handleMockApiRequest(request, path);
    } catch (mockError) {
      console.error('API proxy and mock database error:', error, mockError);
      return NextResponse.json(
        { detail: 'API server unavailable' },
        { status: 502 }
      );
    }
  }
}
