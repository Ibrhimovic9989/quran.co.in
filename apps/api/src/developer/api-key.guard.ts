// Optional API-key guard, registered globally. It NEVER blocks anonymous
// traffic (our own web SSR + apps call the public endpoints with no key and
// must keep working). When a key IS supplied it is validated, the caller is
// identified, per-client rate limiting applies, and usage is recorded.

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { rateLimit } from '../common/rate-limit';
import { ApiKeyRepository } from './api-key.repository';
import { hashApiKey } from './api-key.util';

/** Requests/minute for an authenticated developer key (free tier). */
const KEYED_RATE_LIMIT = 600;
const RATE_WINDOW_MS = 60_000;

export interface ApiClientContext {
  id: string;
  name: string;
  scopes: string;
}

export interface KeyedRequest extends Request {
  apiClient?: ApiClientContext;
}

function extractApiKey(req: Request): string | undefined {
  const header = req.headers['x-api-key'];
  if (typeof header === 'string' && header) return header;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Api-Key ')) return auth.slice(8);
  const q = (req.query?.api_key as string | undefined) ?? undefined;
  return q || undefined;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly keys: ApiKeyRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<KeyedRequest>();
    const raw = extractApiKey(req);
    if (!raw) return true; // anonymous — unchanged behaviour

    const client = await this.keys.findByHash(hashApiKey(raw));
    if (!client || client.revoked) {
      throw new UnauthorizedException({ error: 'Invalid or revoked API key.' });
    }

    req.apiClient = { id: client.id, name: client.name, scopes: client.scopes };

    const res = context.switchToHttp().getResponse<Response>();
    const rl = rateLimit(`apikey:${client.id}`, KEYED_RATE_LIMIT, RATE_WINDOW_MS);
    res.setHeader('X-RateLimit-Limit', String(KEYED_RATE_LIMIT));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    if (!rl.ok) {
      res.setHeader('Retry-After', String(rl.retryAfterSeconds));
      throw new HttpException(
        { error: 'API rate limit exceeded. Slow down or contact us for a higher tier.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.keys.recordUsage(client.id);
    return true;
  }
}
