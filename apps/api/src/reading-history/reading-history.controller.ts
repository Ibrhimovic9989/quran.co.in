// Reading history endpoints — same paths + shapes as the old Next route.
//   GET  /api/reading-history  → { readingHistory }
//   POST /api/reading-history  { surahNumber, ayahNumber? } → { readingHistory }

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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { ReadingHistoryRepository } from './reading-history.repository';

@Controller('reading-history')
@UseGuards(JwtAuthGuard)
export class ReadingHistoryController {
  private readonly logger = new Logger(ReadingHistoryController.name);

  constructor(private readonly history: ReadingHistoryRepository) {}

  @Get()
  async latest(@CurrentUser() user: JwtUser) {
    try {
      const latest = await this.history.getLatest(user.userId);
      return { readingHistory: latest };
    } catch (error) {
      this.logger.error('Error fetching reading history', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Post()
  async record(
    @CurrentUser() user: JwtUser,
    @Body() body: { surahNumber?: number; ayahNumber?: number },
  ) {
    const { surahNumber, ayahNumber } = body ?? {};
    if (!surahNumber) {
      throw new BadRequestException({ error: 'surahNumber is required' });
    }

    try {
      const readingHistory = await this.history.upsert({
        userId: user.userId,
        surahNumber,
        ayahNumber,
      });
      return { readingHistory };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error creating reading history', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }
}
