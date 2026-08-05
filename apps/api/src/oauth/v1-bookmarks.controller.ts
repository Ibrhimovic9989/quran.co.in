// Bookmarks, on behalf of a user, for third-party OAuth2 apps. Same behaviour as
// the first-party /api/bookmarks endpoints, but authorized by a Logto access
// token and gated on the bookmarks:read / bookmarks:write scopes.
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
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { BookmarkRepository } from '../bookmarks/bookmark.repository';
import { CreateBookmarkDto } from '../bookmarks/dto/create-bookmark.dto';
import { LogtoAuthGuard } from './logto-auth.guard';
import { RequiredScopes } from './scopes.decorator';

@ApiTags('oauth')
@ApiSecurity('oauth2')
@Controller('v1/bookmarks')
@UseGuards(LogtoAuthGuard)
export class V1BookmarksController {
  private readonly logger = new Logger(V1BookmarksController.name);

  constructor(private readonly bookmarks: BookmarkRepository) {}

  @Get()
  @RequiredScopes('bookmarks:read')
  @ApiOperation({ summary: "List the authorizing user's bookmarks." })
  async list(@CurrentUser() user: JwtUser) {
    try {
      return { bookmarks: await this.bookmarks.findByUserId(user.userId) };
    } catch (error) {
      this.logger.error('Error listing bookmarks', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Post()
  @RequiredScopes('bookmarks:write')
  @ApiOperation({ summary: 'Add or update a bookmark for the authorizing user.' })
  async create(@CurrentUser() user: JwtUser, @Body() body: CreateBookmarkDto) {
    const { surahNumber, ayahNumber, note } = body ?? {};
    if (!surahNumber) throw new BadRequestException({ error: 'surahNumber is required' });
    try {
      const existing = await this.bookmarks.findByUserAndAyah(user.userId, surahNumber, ayahNumber);
      if (existing) {
        return { bookmark: await this.bookmarks.update(user.userId, surahNumber, ayahNumber, { note }) };
      }
      await this.bookmarks.deleteAllInSurah(user.userId, surahNumber);
      return { bookmark: await this.bookmarks.create({ userId: user.userId, surahNumber, ayahNumber, note }) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error creating bookmark', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }

  @Delete(':surahNumber')
  @RequiredScopes('bookmarks:write')
  async deleteSurah(@CurrentUser() user: JwtUser, @Param('surahNumber') surah: string) {
    return this.remove(user, surah, undefined);
  }

  @Delete(':surahNumber/:ayahNumber')
  @RequiredScopes('bookmarks:write')
  async deleteAyah(
    @CurrentUser() user: JwtUser,
    @Param('surahNumber') surah: string,
    @Param('ayahNumber') ayah: string,
  ) {
    return this.remove(user, surah, ayah);
  }

  private async remove(user: JwtUser, surahRaw: string, ayahRaw: string | undefined) {
    const surahNumber = parseInt(surahRaw, 10);
    const ayahNumber = ayahRaw !== undefined ? parseInt(ayahRaw, 10) : undefined;
    if (Number.isNaN(surahNumber)) throw new BadRequestException({ error: 'Invalid surahNumber' });
    try {
      await this.bookmarks.delete(user.userId, surahNumber, ayahNumber);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting bookmark', error as Error);
      throw new InternalServerErrorException({ error: 'Internal server error' });
    }
  }
}
