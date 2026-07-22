// Bookmarks endpoints — same paths + response shapes as the old Next routes.
//   GET    /api/bookmarks
//   POST   /api/bookmarks                       { surahNumber, ayahNumber?, note? }
//   DELETE /api/bookmarks/:surahNumber
//   DELETE /api/bookmarks/:surahNumber/:ayahNumber

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { BookmarkRepository } from './bookmark.repository';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  private readonly logger = new Logger(BookmarksController.name);

  constructor(private readonly bookmarks: BookmarkRepository) {}

  @Get()
  async list(@CurrentUser() user: JwtUser) {
    try {
      const bookmarks = await this.bookmarks.findByUserId(user.userId);
      return { bookmarks };
    } catch (error) {
      this.logger.error('Error fetching bookmarks', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Post()
  async create(@CurrentUser() user: JwtUser, @Body() body: CreateBookmarkDto) {
    const { surahNumber, ayahNumber, note } = body ?? {};
    if (!surahNumber) {
      throw new BadRequestException({ error: 'surahNumber is required' });
    }

    try {
      const existing = await this.bookmarks.findByUserAndAyah(user.userId, surahNumber, ayahNumber);
      if (existing) {
        const updated = await this.bookmarks.update(user.userId, surahNumber, ayahNumber, { note });
        return { bookmark: updated };
      }

      // Only one bookmark per surah
      await this.bookmarks.deleteAllInSurah(user.userId, surahNumber);

      const bookmark = await this.bookmarks.create({
        userId: user.userId,
        surahNumber,
        ayahNumber,
        note,
      });
      return { bookmark };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error creating bookmark', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Delete(':surahNumber')
  async deleteSurahBookmark(@CurrentUser() user: JwtUser, @Param('surahNumber') surahRaw: string) {
    return this.deleteBookmark(user, surahRaw, undefined);
  }

  @Delete(':surahNumber/:ayahNumber')
  async deleteAyahBookmark(
    @CurrentUser() user: JwtUser,
    @Param('surahNumber') surahRaw: string,
    @Param('ayahNumber') ayahRaw: string,
  ) {
    return this.deleteBookmark(user, surahRaw, ayahRaw);
  }

  private async deleteBookmark(user: JwtUser, surahRaw: string, ayahRaw: string | undefined) {
    const surahNumber = parseInt(surahRaw, 10);
    const ayahNumber = ayahRaw !== undefined ? parseInt(ayahRaw, 10) : undefined;

    if (Number.isNaN(surahNumber)) {
      throw new BadRequestException({ error: 'Invalid surahNumber' });
    }

    try {
      await this.bookmarks.delete(user.userId, surahNumber, ayahNumber);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting bookmark', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }
}
