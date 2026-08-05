// Self-serve registration of third-party OAuth2 apps (the "add your redirect
// URLs" flow). A signed-in developer registers an app; we create it in Logto as
// a confidential third-party client, grant it consent for our API scopes, and
// return client_id + client_secret (shown once). Ownership is tracked in the
// Logto app's customData, so one developer can't see or edit another's.
//   POST   /api/developer/oauth-apps          { name, redirectUris }
//   GET    /api/developer/oauth-apps
//   PATCH  /api/developer/oauth-apps/:id       { redirectUris }
//   DELETE /api/developer/oauth-apps/:id
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { LogtoService } from '../oauth/logto.service';
import { CreateOAuthAppDto, UpdateOAuthAppDto } from './dto/oauth-app.dto';

@ApiTags('developer')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('developer/oauth-apps')
@UseGuards(JwtAuthGuard)
export class OAuthAppsController {
  private readonly logger = new Logger(OAuthAppsController.name);

  constructor(private readonly logto: LogtoService) {}

  @Get()
  @ApiOperation({ summary: 'List your registered OAuth apps.' })
  async list(@CurrentUser() user: JwtUser) {
    try {
      return { apps: await this.logto.listAppsByOwner(user.userId) };
    } catch (error) {
      throw this.wrap(error, 'list OAuth apps');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Register an OAuth app (client secret is returned only once).' })
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateOAuthAppDto) {
    try {
      const { clientId, clientSecret, app } = await this.logto.createThirdPartyApp(
        user.userId,
        dto.name,
        dto.redirectUris,
      );
      return {
        clientId,
        clientSecret,
        app,
        warning: 'Store the client secret now — for your security it will not be shown again.',
      };
    } catch (error) {
      throw this.wrap(error, 'create OAuth app');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an app’s redirect URIs.' })
  async update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateOAuthAppDto) {
    try {
      return { app: await this.logto.updateRedirectUris(user.userId, id, dto.redirectUris) };
    } catch (error) {
      throw this.wrap(error, 'update OAuth app');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an OAuth app.' })
  async remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    try {
      await this.logto.deleteApp(user.userId, id);
      return { success: true };
    } catch (error) {
      throw this.wrap(error, 'delete OAuth app');
    }
  }

  private wrap(error: unknown, action: string): HttpException {
    if (error instanceof HttpException) return error;
    this.logger.error(`Failed to ${action}`, error as Error);
    return new InternalServerErrorException({ error: 'Internal server error' });
  }
}
