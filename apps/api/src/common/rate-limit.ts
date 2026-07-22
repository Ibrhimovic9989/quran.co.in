// Lightweight in-memory rate limiter (fixed window) — ported from
// apps/web/lib/utils/rate-limit.ts, adapted to Express/Nest.
//
// NOTE: per-instance. Effective against a single client hammering one node;
// swap the store for Redis (same interface) when the API runs multi-instance
// on Render. TODO(deploy): back with Redis via REDIS_URL.

import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the Map doesn't grow unbounded.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client IP (Render/Vercel set x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  const first = Array.isArray(xff) ? xff[0] : xff?.split(',')[0];
  return first?.trim() || req.socket.remoteAddress || 'unknown';
}

/**
 * Check the limit; on exceed set Retry-After and throw a 429 with the same
 * body shape the old Next routes returned.
 */
export function enforceRateLimit(
  req: Request,
  res: Response,
  keyPrefix: string,
  limit: number,
  windowMs: number,
): void {
  const result = rateLimit(`${keyPrefix}:${clientIp(req)}`, limit, windowMs);
  if (result.ok) return;

  res.setHeader('Retry-After', String(result.retryAfterSeconds));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  throw new HttpException(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}
