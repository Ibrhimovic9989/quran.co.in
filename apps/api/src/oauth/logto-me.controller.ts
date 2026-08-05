// Example third-party endpoint: returns the authorizing user's profile when
// called with a Logto access token carrying the `profile:read` scope. This
// proves the whole chain (token verify → scope check → user mapping). Bookmarks
// / reading-history "on behalf of a user" endpoints follow this exact pattern.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { UserRepository } from '../users/user.repository';
import { LogtoAuthGuard } from './logto-auth.guard';
import { RequiredScopes } from './scopes.decorator';

@ApiTags('oauth')
@ApiSecurity('oauth2')
@Controller('v1/me')
export class LogtoMeController {
  constructor(private readonly users: UserRepository) {}

  @Get()
  @UseGuards(LogtoAuthGuard)
  @RequiredScopes('profile:read')
  @ApiOperation({
    summary: 'Profile of the user who authorized your app (OAuth2 access token, scope: profile:read).',
  })
  async me(@CurrentUser() user: JwtUser) {
    const full = await this.users.findById(user.userId);
    return {
      user: full ? { id: full.id, email: full.email, name: full.name, imageUrl: full.imageUrl } : null,
    };
  }
}
