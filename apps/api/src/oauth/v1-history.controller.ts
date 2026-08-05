// Reading history, on behalf of a user, for third-party OAuth2 apps. Authorized
// by a Logto access token and gated on the history:read / history:write scopes.
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { ReadingHistoryRepository } from '../reading-history/reading-history.repository';
import { RecordReadingDto } from '../reading-history/dto/record-reading.dto';
import { LogtoAuthGuard } from './logto-auth.guard';
import { RequiredScopes } from './scopes.decorator';

@ApiTags('oauth')
@ApiSecurity('oauth2')
@Controller('v1/history')
@UseGuards(LogtoAuthGuard)
export class V1HistoryController {
  private readonly logger = new Logger(V1HistoryController.name);

  constructor(private readonly history: ReadingHistoryRepository) {}

  @Get()
  @RequiredScopes('history:read')
  @ApiOperation({ summary: "The authorizing user's recent reading history." })
  async list(@CurrentUser() user: JwtUser) {
    try {
      return { history: await this.history.findByUserId(user.userId, 50) };
    } catch (error) {
      this.logger.error('Error listing reading history', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Post()
  @RequiredScopes('history:write')
  @ApiOperation({ summary: 'Record a reading position for the authorizing user.' })
  async record(@CurrentUser() user: JwtUser, @Body() body: RecordReadingDto) {
    const { surahNumber, ayahNumber } = body ?? {};
    if (!surahNumber) throw new BadRequestException({ error: 'surahNumber is required' });
    try {
      return { readingHistory: await this.history.upsert({ userId: user.userId, surahNumber, ayahNumber }) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error recording reading history', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }
}
