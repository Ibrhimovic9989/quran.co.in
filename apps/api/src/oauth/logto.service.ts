// Logto (managed OAuth2/OIDC provider) integration. Third-party apps registered
// in Logto obtain user-consented access tokens for the `LOGTO_API_INDICATOR`
// resource; here we (1) verify those tokens against Logto's JWKS and (2) map the
// Logto user (`sub`) to our own User record by email, so the rest of the API can
// act on the user's behalf exactly as it does for first-party sessions.

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { UserRepository } from '../users/user.repository';

export interface LogtoGrant {
  sub: string;
  scopes: string[];
  clientId?: string;
}

/** A developer's third-party OAuth app, as shown in the portal. */
export interface OAuthAppView {
  id: string; // this is the client_id
  name: string;
  redirectUris: string[];
  createdAt?: number;
}

interface LogtoApp {
  id: string;
  name: string;
  isThirdParty?: boolean;
  oidcClientMetadata?: { redirectUris?: string[]; postLogoutRedirectUris?: string[] };
  customData?: { ownerUserId?: string };
  createdAt?: number;
}

function toView(a: LogtoApp): OAuthAppView {
  return {
    id: a.id,
    name: a.name,
    redirectUris: a.oidcClientMetadata?.redirectUris ?? [],
    createdAt: a.createdAt,
  };
}

@Injectable()
export class LogtoService {
  private readonly logger = new Logger(LogtoService.name);
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private mgmt?: { token: string; expiresAt: number };
  private readonly userCache = new Map<string, { email: string; name?: string; at: number }>();
  private readonly appOwnerCache = new Map<string, { ownerId?: string; at: number }>();
  private scopeIds?: { ids: string[]; at: number };
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

  // ── Third-party app management (developer portal) ──────────────────────────

  private async api(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.managementToken();
    return fetch(`${this.endpoint()}/api${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  }

  /** Scope ids of our API resource — what a third-party app may request. Cached. */
  private async resourceScopeIds(): Promise<string[]> {
    if (this.scopeIds && Date.now() - this.scopeIds.at < 10 * 60_000) return this.scopeIds.ids;
    const resources = (await (await this.api('/resources')).json()) as Array<{ id: string; indicator: string }>;
    const res = resources.find((r) => r.indicator === this.indicator());
    if (!res) return [];
    const scopes = (await (await this.api(`/resources/${res.id}/scopes`)).json()) as Array<{ id: string }>;
    const ids = scopes.map((s) => s.id);
    this.scopeIds = { ids, at: Date.now() };
    return ids;
  }

  /**
   * Our User id that owns the OAuth app with this client_id (from the app's
   * customData). Cached — used to check the developer's Ask approval per request.
   */
  async appOwnerId(clientId: string): Promise<string | undefined> {
    const cached = this.appOwnerCache.get(clientId);
    if (cached && Date.now() - cached.at < LogtoService.USER_TTL) return cached.ownerId;
    const res = await this.api(`/applications/${encodeURIComponent(clientId)}`);
    if (!res.ok) {
      this.appOwnerCache.set(clientId, { ownerId: undefined, at: Date.now() });
      return undefined;
    }
    const app = (await res.json()) as LogtoApp;
    const ownerId = app.customData?.ownerUserId;
    this.appOwnerCache.set(clientId, { ownerId, at: Date.now() });
    return ownerId;
  }

  /** Fetch an app and assert the caller owns it (owner is stored in customData). */
  private async ownedApp(ownerId: string, id: string): Promise<LogtoApp> {
    const res = await this.api(`/applications/${encodeURIComponent(id)}`);
    if (!res.ok) throw new NotFoundException({ error: 'App not found.' });
    const app = (await res.json()) as LogtoApp;
    if (app.customData?.ownerUserId !== ownerId) throw new NotFoundException({ error: 'App not found.' });
    return app;
  }

  async listAppsByOwner(ownerId: string): Promise<OAuthAppView[]> {
    // Logto caps page_size at 100 and 400s on anything larger — page through it.
    // Always check res.ok: a Logto error is a JSON *object*, and calling
    // .filter on it would throw a raw 500 (the "Internal server error" bug).
    const PAGE = 100;
    const all: LogtoApp[] = [];
    for (let page = 1; page <= 50; page++) {
      const res = await this.api(`/applications?page=${page}&page_size=${PAGE}`);
      if (!res.ok) {
        this.logger.error(`Logto list applications failed: ${res.status} ${await res.text()}`);
        throw new ServiceUnavailableException({ error: 'OAuth provider is unavailable.' });
      }
      const batch = (await res.json()) as LogtoApp[];
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (batch.length < PAGE) break;
    }
    return all.filter((a) => a.isThirdParty && a.customData?.ownerUserId === ownerId).map(toView);
  }

  /** Register a confidential third-party app; returns client_id + client_secret. */
  async createThirdPartyApp(
    ownerId: string,
    name: string,
    redirectUris: string[],
  ): Promise<{ clientId: string; clientSecret: string; app: OAuthAppView }> {
    const res = await this.api('/applications', {
      method: 'POST',
      body: JSON.stringify({
        name,
        type: 'Traditional',
        isThirdParty: true,
        oidcClientMetadata: { redirectUris, postLogoutRedirectUris: [] },
        customData: { ownerUserId: ownerId },
      }),
    });
    if (!res.ok) throw new BadRequestException({ error: 'Could not create the application.' });
    const app = (await res.json()) as LogtoApp;

    // Let the app request our API scopes (+ the user's email/profile) with consent.
    const scopeIds = await this.resourceScopeIds();
    await this.api(`/applications/${app.id}/user-consent-scopes`, {
      method: 'POST',
      body: JSON.stringify({ resourceScopes: scopeIds, userScopes: ['email', 'profile'] }),
    });

    const secrets = (await (await this.api(`/applications/${app.id}/secrets`)).json()) as Array<{ value: string }>;
    return { clientId: app.id, clientSecret: secrets[0]?.value ?? '', app: toView(app) };
  }

  async updateRedirectUris(ownerId: string, id: string, redirectUris: string[]): Promise<OAuthAppView> {
    const app = await this.ownedApp(ownerId, id);
    const res = await this.api(`/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        oidcClientMetadata: { ...(app.oidcClientMetadata ?? {}), redirectUris, postLogoutRedirectUris: [] },
      }),
    });
    if (!res.ok) throw new BadRequestException({ error: 'Could not update the application.' });
    return toView((await res.json()) as LogtoApp);
  }

  async deleteApp(ownerId: string, id: string): Promise<void> {
    await this.ownedApp(ownerId, id);
    await this.api(`/applications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
