// Gate for the costly AI endpoint (POST /api/quran/ask). The AI has real
// per-call cost, so we don't leave it open to anonymous traffic like the read
// endpoints. A request is allowed when EITHER:
//   • a first-party user is signed in (httpOnly cookie or Bearer JWT) — this is
//     the site's own Ask, which is free but requires sign-in; or
//   • an API key is presented whose owner has been approved for Ask (the
//     third-party developer path — approval is manual).
// Anonymous → 401 (sign in). A key without approval → 403 (request access).

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { extractToken, type AuthedRequest } from '../auth/jwt-auth.guard';
import type { KeyedRequest } from '../developer/api-key.guard';

@Injectable()
export class AskAccessGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<AuthedRequest & KeyedRequest>();

    // Third-party path: the global ApiKeyGuard already validated any key and
    // attached the client (with the owner's approval state).
    if (req.apiClient) {
      if (req.apiClient.askApproved) return true;
      throw new ForbiddenException({
        error:
          'This API key is not approved for Ask. Request access from your developer dashboard.',
      });
    }

    // First-party path: a signed-in quran.co.in user. Site usage is free.
    const token = extractToken(req);
    if (token) {
      try {
        req.user = this.auth.verifyAccessToken(token);
        return true;
      } catch {
        // invalid/expired token → fall through to 401
      }
    }

    throw new UnauthorizedException({ error: 'Sign in to use Ask.' });
  }
}
