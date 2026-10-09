import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60 * 1000; // 1 minute
  private lastCleanup = Date.now();

  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();

    // Prevent memory leaks / DoS by sweeping expired entries periodically
    if (now - this.lastCleanup > 60 * 1000 || this.store.size > 5000) {
      this.cleanup(now);
    }

    const url = req.originalUrl || req.url || '';
    const isAuthRoute = url.includes('/v1/auth/');
    const isVoidRoute = url.endsWith('/void') || url.includes('/void?');

    // Granular rate limits to prevent brute-force and automated void attacks:
    // - Auth: 30 requests/minute
    // - Void: 60 requests/minute
    // - General: 500 requests/minute
    const maxRequests = isAuthRoute ? 30 : isVoidRoute ? 60 : 500;

    const key = this.getKey(req, isAuthRoute ? 'auth' : isVoidRoute ? 'void' : 'api');
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: isVoidRoute
            ? 'Too many void requests. Please wait before retiring more records.'
            : isAuthRoute
              ? 'Too many authentication attempts. Please try again shortly.'
              : 'Too many requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }

  private getKey(req: Request, prefix: string): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = (req as Request & { user?: { id?: string } }).user?.id || '';
    return `${prefix}:${ip}:${userId}`;
  }

  private cleanup(now: number) {
    this.lastCleanup = now;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
