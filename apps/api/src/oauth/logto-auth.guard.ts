// Authorizes a third-party request bearing a Logto access token, enforces the
// scopes declared with @RequiredScopes, and attaches the mapped first-party user
// as request.user — so @CurrentUser() works exactly as under JwtAuthGuard.

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { LogtoService } from './logto.service';
import { SCOPES_KEY } from './scopes.decorator';

@Injectable()
export class LogtoAuthGuard implements CanActivate {
  constructor(
    private readonly logto: LogtoService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: unknown; oauthScopes?: string[] }>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ error: 'A Bearer access token is required.' });
    }

    const grant = await this.logto.verify(header.slice(7));

    const required =
      this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [context.getHandler(), context.getClass()]) ?? [];
    const missing = required.filter((s) => !grant.scopes.includes(s));
    if (missing.length) {
      throw new ForbiddenException({ error: `Access token is missing scope(s): ${missing.join(', ')}` });
    }

    const user = await this.logto.resolveUser(grant.sub);
    req.user = { userId: user.id, email: user.email };
    req.oauthScopes = grant.scopes;
    return true;
  }
}
