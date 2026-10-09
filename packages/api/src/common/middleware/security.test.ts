import { describe, it, expect, vi } from 'vitest';
import { SecurityMiddleware } from './security.middleware';
import { RateLimitMiddleware } from './rate-limit.middleware';
import type { Request, Response } from 'express';

describe('SecurityMiddleware', () => {
  it('sets defensive HTTP security headers', () => {
    const middleware = new SecurityMiddleware();
    const headers: Record<string, string> = {};
    const removed: string[] = [];

    const req = {} as Request;
    const res = {
      setHeader: vi.fn((k: string, v: string) => { headers[k] = v; }),
      removeHeader: vi.fn((k: string) => { removed.push(k); }),
    } as unknown as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-XSS-Protection']).toBe('0');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(removed).toContain('X-Powered-By');
    expect(next).toHaveBeenCalled();
  });
});

describe('RateLimitMiddleware', () => {
  it('enforces rate limits on void endpoints to prevent automated void attacks', () => {
    const middleware = new RateLimitMiddleware();
    const req = {
      originalUrl: '/v1/expenses/test-id/void',
      ip: '192.168.1.100',
    } as unknown as Request;

    const res = {
      setHeader: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    // Within limit (60 max for void)
    for (let i = 0; i < 60; i++) {
      middleware.use(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(60);

    // 61st request should trigger 429
    expect(() => middleware.use(req, res, next)).toThrowError();
  });

  it('enforces stricter limits on authentication endpoints', () => {
    const middleware = new RateLimitMiddleware();
    const req = {
      originalUrl: '/v1/auth/login',
      ip: '192.168.1.101',
    } as unknown as Request;

    const res = {
      setHeader: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    // 30 requests permitted for auth
    for (let i = 0; i < 30; i++) {
      middleware.use(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(30);

    // 31st request triggers rate limit exception
    expect(() => middleware.use(req, res, next)).toThrowError();
  });
});
