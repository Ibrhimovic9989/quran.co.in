// Auth service — the single token authority for web AND mobile clients.
//
// Web:    browser → GET /api/auth/google → Google consent →
//         GET /api/auth/google/callback → httpOnly cookies → redirect to web.
// Mobile: native Google Sign-In → POST /api/auth/google/mobile { idToken } →
//         { accessToken, refreshToken } JSON for secure storage.
//
// User sync mirrors the old NextAuth signIn callback (lib/auth/config.ts):
// find by email; create with authProviderId = Google `sub` if missing,
// otherwise refresh name/image.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import type { User } from '@prisma/client';
import { UserRepository } from '../users/user.repository';

export interface AuthTokens {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface JwtUser {
  userId: string;
  email: string;
}

const ACCESS_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL = '30d';

@Injectable()
export class AuthService {
  private readonly oauthClient: OAuth2Client;

  constructor(
    private readonly jwt: JwtService,
    private readonly users: UserRepository,
  ) {
    this.oauthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3001/api/auth/google/callback',
    );
  }

  /** URL to send the browser to for the Google consent screen. */
  getGoogleAuthUrl(state: string): string {
    return this.oauthClient.generateAuthUrl({
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });
  }

  /** Web flow: exchange the callback `code`, then log in with the id_token. */
  async handleGoogleCallback(code: string): Promise<AuthTokens> {
    const { tokens } = await this.oauthClient.getToken(code);
    if (!tokens.id_token) {
      throw new UnauthorizedException({ error: 'Google did not return an id_token' });
    }
    return this.loginWithGoogleIdToken(tokens.id_token);
  }

  /** Shared by web callback and the mobile endpoint. */
  async loginWithGoogleIdToken(idToken: string): Promise<AuthTokens> {
    // Accept tokens minted for the web client and (later) mobile client ids.
    const audience = [
      process.env.GOOGLE_CLIENT_ID,
      ...(process.env.GOOGLE_MOBILE_CLIENT_IDS ?? '').split(','),
    ]
      .map((s) => s?.trim())
      .filter((s): s is string => !!s);

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.oauthClient.verifyIdToken({ idToken, audience });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException({ error: 'Invalid Google token' });
    }

    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException({ error: 'Google token missing email' });
    }

    const user = await this.syncUser(payload);
    return this.issueTokens(user);
  }

  /** Verify a refresh token and issue a fresh pair. */
  async refresh(refreshToken: string | undefined): Promise<AuthTokens> {
    if (!refreshToken) throw new UnauthorizedException({ error: 'Missing refresh token' });

    let payload: { sub: string; email: string; typ?: string };
    try {
      payload = this.jwt.verify(refreshToken, { secret: this.refreshSecret() });
    } catch {
      throw new UnauthorizedException({ error: 'Invalid refresh token' });
    }
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException({ error: 'Invalid refresh token' });
    }

    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException({ error: 'User not found' });

    return this.issueTokens(user);
  }

  verifyAccessToken(token: string): JwtUser {
    const payload = this.jwt.verify<{ sub: string; email: string }>(token, {
      secret: this.accessSecret(),
    });
    return { userId: payload.sub, email: payload.email };
  }

  private async syncUser(payload: TokenPayload): Promise<User> {
    const email = payload.email!;
    const existing = await this.users.findByEmail(email);

    if (!existing) {
      return this.users.create({
        authProviderId: payload.sub,
        email,
        name: payload.name || email.split('@')[0],
        imageUrl: payload.picture ?? undefined,
      });
    }

    return this.users.update(existing.id, {
      name: payload.name || existing.name,
      imageUrl: payload.picture ?? existing.imageUrl ?? undefined,
    });
  }

  private issueTokens(user: User): AuthTokens {
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { secret: this.accessSecret(), expiresIn: ACCESS_TOKEN_TTL },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id, email: user.email, typ: 'refresh' },
      { secret: this.refreshSecret(), expiresIn: REFRESH_TOKEN_TTL },
    );
    return { user, accessToken, refreshToken };
  }

  private accessSecret(): string {
    const s = process.env.JWT_ACCESS_SECRET;
    if (!s) throw new Error('JWT_ACCESS_SECRET is not set');
    return s;
  }

  private refreshSecret(): string {
    const s = process.env.JWT_REFRESH_SECRET;
    if (!s) throw new Error('JWT_REFRESH_SECRET is not set');
    return s;
  }
}
