// JwtAuthGuard — authorizes a request from EITHER client type:
//   web:    httpOnly `access_token` cookie (credentials-included fetch)
//   mobile: `Authorization: Bearer <token>` header
// On success attaches { userId, email } as request.user.

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type JwtUser } from './auth.service';

export interface AuthedRequest extends Request {
  user?: JwtUser;
}

export function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return (req as AuthedRequest).cookies?.access_token;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = extractToken(req);
    if (!token) throw new UnauthorizedException({ error: 'Unauthorized' });

    try {
      req.user = this.auth.verifyAccessToken(token);
      return true;
    } catch {
      throw new UnauthorizedException({ error: 'Unauthorized' });
    }
  }
}

/** Same extraction, but anonymous requests pass through with request.user unset. */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = extractToken(req);
    if (token) {
      try {
        req.user = this.auth.verifyAccessToken(token);
      } catch {
        // invalid/expired token → treat as guest
      }
    }
    return true;
  }
}
