// Auth endpoints.
//   GET  /api/auth/google          → redirect to Google consent (web)
//   GET  /api/auth/google/callback → set cookies, redirect back to web
//   POST /api/auth/google/mobile   → { user, accessToken, refreshToken } (Flutter)
//   POST /api/auth/refresh         → rotate tokens (cookie or body)
//   POST /api/auth/logout          → clear cookies
//   GET  /api/auth/me              → current user (guarded)

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { AuthService, type JwtUser } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { UserRepository } from '../users/user.repository';
import { GoogleMobileDto } from './dto/google-mobile.dto';

const ACCESS_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7d — matches token TTL
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30d

function appDeepLink(): string {
  return process.env.APP_DEEP_LINK ?? 'quranapp://auth';
}

/** OAuth state: JSON-encoded { r: redirect path, m: mobile flag }. */
function encodeState(redirect: string | undefined, mobile: boolean): string {
  return encodeURIComponent(JSON.stringify({ r: safeRedirectPath(redirect), m: mobile }));
}

function decodeState(raw: string | undefined): { r: string; m: boolean } {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw ?? '')) as { r?: string; m?: boolean };
    return { r: safeRedirectPath(parsed.r), m: Boolean(parsed.m) };
  } catch {
    // Legacy state format: a bare URI-encoded path
    return { r: safeRedirectPath(decodeURIComponent(raw ?? '/')), m: false };
  }
}

function webUrl(): string {
  return (process.env.WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

/** Only allow same-site path redirects (no scheme, no protocol-relative). */
function safeRedirectPath(raw: string | undefined): string {
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) return '/';
  return raw;
}

function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserRepository,
  ) {}

  private cookieOptions(maxAge: number, path = '/') {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      domain: process.env.COOKIE_DOMAIN || undefined, // e.g. .quran.co.in in prod
      maxAge,
      path,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, this.cookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie('refresh_token', refreshToken, this.cookieOptions(REFRESH_COOKIE_MAX_AGE, '/api/auth'));
  }

  private clearAuthCookies(res: Response) {
    res.cookie('access_token', '', this.cookieOptions(0));
    res.cookie('refresh_token', '', this.cookieOptions(0, '/api/auth'));
  }

  @Get('google')
  google(
    @Query('redirect') redirect: string | undefined,
    @Query('client') client: string | undefined,
    @Res() res: Response,
  ) {
    // client=mobile → finish by deep-linking tokens back into the native app
    const state = encodeState(redirect, client === 'mobile');
    res.redirect(this.auth.getGoogleAuthUrl(state));
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    if (!code) {
      const st = decodeState(state);
      res.redirect(st.m ? `${appDeepLink()}#error=oauth` : `${webUrl()}/sign-in?error=oauth`);
      return;
    }
    const parsedState = decodeState(state);
    try {
      const { accessToken, refreshToken } = await this.auth.handleGoogleCallback(code);
      if (parsedState.m) {
        // Mobile shell: hand tokens to the app via deep link. Fragment (#)
        // keeps them out of server logs and referrers.
        res.redirect(
          `${appDeepLink()}#access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`,
        );
        return;
      }
      this.setAuthCookies(res, accessToken, refreshToken);
      res.redirect(`${webUrl()}${parsedState.r}`);
    } catch (err) {
      console.error('[auth] google callback failed:', err);
      if (parsedState.m) {
        res.redirect(`${appDeepLink()}#error=oauth`);
        return;
      }
      res.redirect(`${webUrl()}/sign-in?error=oauth`);
    }
  }

  /** Flutter/native: exchange a Google ID token for API tokens (JSON, no cookies). */
  @Post('google/mobile')
  async googleMobile(@Body() body: GoogleMobileDto) {
    if (!body?.idToken) throw new UnauthorizedException({ error: 'idToken is required' });
    const { user, accessToken, refreshToken } = await this.auth.loginWithGoogleIdToken(body.idToken);
    return { user: publicUser(user), accessToken, refreshToken };
  }

  /** Refresh: web sends the cookie automatically; mobile passes it in the body. */
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: { refreshToken?: string },
  ) {
    const token =
      (req as Request & { cookies?: Record<string, string> }).cookies?.refresh_token ??
      body?.refreshToken;
    const { user, accessToken, refreshToken } = await this.auth.refresh(token);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user: publicUser(user), accessToken, refreshToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.users.findById(jwtUser.userId);
    if (!user) throw new UnauthorizedException({ error: 'Unauthorized' });
    return { user: publicUser(user) };
  }
}
