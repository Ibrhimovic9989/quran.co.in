// Logto (managed OAuth2/OIDC provider) integration. Third-party apps registered
// in Logto obtain user-consented access tokens for the `LOGTO_API_INDICATOR`
// resource; here we (1) verify those tokens against Logto's JWKS and (2) map the
// Logto user (`sub`) to our own User record by email, so the rest of the API can
// act on the user's behalf exactly as it does for first-party sessions.

import { Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { UserRepository } from '../users/user.repository';

export interface LogtoGrant {
  sub: string;
  scopes: string[];
  clientId?: string;
}

@Injectable()
export class LogtoService {
  private readonly logger = new Logger(LogtoService.name);
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private mgmt?: { token: string; expiresAt: number };
  private readonly userCache = new Map<string, { email: string; name?: string; at: number }>();
  private static readonly USER_TTL = 5 * 60_000;

  constructor(private readonly users: UserRepository) {}

  private endpoint(): string {
    return (process.env.LOGTO_ENDPOINT ?? '').replace(/\/$/, '');
  }
  private indicator(): string {
    return process.env.LOGTO_API_INDICATOR ?? 'https://api.quran.co.in';
  }

  /** Whether Logto is configured in this environment. */
  configured(): boolean {
    return Boolean(this.endpoint() && process.env.LOGTO_M2M_ID && process.env.LOGTO_M2M_SECRET);
  }

  private keys() {
    if (!this.jwks) this.jwks = createRemoteJWKSet(new URL(`${this.endpoint()}/oidc/jwks`));
    return this.jwks;
  }

  /** Verify a Logto access token issued for our API resource. */
  async verify(token: string): Promise<LogtoGrant> {
    if (!this.endpoint()) {
      throw new ServiceUnavailableException({ error: 'OAuth is not configured on this server.' });
    }
    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(token, this.keys(), {
        issuer: `${this.endpoint()}/oidc`,
        audience: this.indicator(),
      }));
    } catch {
      throw new UnauthorizedException({ error: 'Invalid or expired access token.' });
    }
    const scope = typeof payload.scope === 'string' ? payload.scope : '';
    return {
      sub: String(payload.sub),
      scopes: scope.split(' ').filter(Boolean),
      clientId: typeof payload.client_id === 'string' ? payload.client_id : undefined,
    };
  }

  /** Resolve the Logto user (`sub`) to our own User, by email; create if new. */
  async resolveUser(sub: string) {
    const { email, name } = await this.logtoUser(sub);
    if (!email) {
      throw new UnauthorizedException({ error: 'This account has no verified email; cannot authorize.' });
    }
    const existing = await this.users.findByEmail(email);
    if (existing) return existing;
    return this.users.create({
      authProviderId: `logto:${sub}`,
      email,
      name: name || email.split('@')[0],
    });
  }

  private async logtoUser(sub: string): Promise<{ email?: string; name?: string }> {
    const cached = this.userCache.get(sub);
    if (cached && Date.now() - cached.at < LogtoService.USER_TTL) {
      return { email: cached.email || undefined, name: cached.name };
    }
    const token = await this.managementToken();
    const res = await fetch(`${this.endpoint()}/api/users/${encodeURIComponent(sub)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      this.logger.warn(`Logto user lookup failed for ${sub}: ${res.status}`);
      throw new UnauthorizedException({ error: 'Could not resolve the authorizing user.' });
    }
    const u = (await res.json()) as { primaryEmail?: string; name?: string };
    this.userCache.set(sub, { email: u.primaryEmail ?? '', name: u.name, at: Date.now() });
    return { email: u.primaryEmail, name: u.name };
  }

  /** A cached Management API access token (client_credentials). */
  private async managementToken(): Promise<string> {
    if (this.mgmt && this.mgmt.expiresAt > Date.now() + 30_000) return this.mgmt.token;
    const basic = Buffer.from(`${process.env.LOGTO_M2M_ID}:${process.env.LOGTO_M2M_SECRET}`).toString('base64');
    const res = await fetch(`${this.endpoint()}/oidc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        resource: `${this.endpoint()}/api`,
        scope: 'all',
      }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException({ error: 'OAuth provider is unavailable.' });
    }
    const j = (await res.json()) as { access_token: string; expires_in?: number };
    this.mgmt = { token: j.access_token, expiresAt: Date.now() + (j.expires_in ?? 3600) * 1000 };
    return this.mgmt.token;
  }
}
