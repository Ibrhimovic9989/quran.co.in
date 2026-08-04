// Developer API-key management. A signed-in user (web cookie or mobile Bearer)
// registers apps and manages their keys here; the keys then authenticate calls
// to the public API.
//   POST   /api/developer/keys        { name }         -> creates a key (shown ONCE)
//   GET    /api/developer/keys                         -> lists the caller's keys
//   DELETE /api/developer/keys/:id                     -> revokes a key
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { ApiKeyRepository } from './api-key.repository';
import { generateApiKey } from './api-key.util';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('developer')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('developer')
@UseGuards(JwtAuthGuard)
export class DeveloperController {
  private readonly logger = new Logger(DeveloperController.name);

  constructor(private readonly keys: ApiKeyRepository) {}

  @Post('keys')
  @ApiOperation({ summary: 'Create an API key (the plaintext key is returned only once).' })
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateApiKeyDto) {
    try {
      const { key, hash, prefix } = generateApiKey();
      const client = await this.keys.create({ name: dto.name, ownerId: user.userId, hash, prefix });
      return {
        apiKey: key,
        warning: 'Store this key now — for your security it will not be shown again.',
        client,
      };
    } catch (error) {
      this.logger.error('Error creating API key', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Get('keys')
  @ApiOperation({ summary: "List the caller's API keys (prefixes only, never the full key)." })
  async list(@CurrentUser() user: JwtUser) {
    try {
      const keys = await this.keys.listByOwner(user.userId);
      return { keys };
    } catch (error) {
      this.logger.error('Error listing API keys', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Delete('keys/:id')
  @ApiOperation({ summary: 'Revoke an API key.' })
  async revoke(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    const ok = await this.keys.revoke(id, user.userId);
    if (!ok) throw new NotFoundException({ error: 'Key not found.' });
    return { success: true };
  }
}
