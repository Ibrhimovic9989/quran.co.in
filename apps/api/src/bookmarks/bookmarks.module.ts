import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarkRepository } from './bookmark.repository';

@Module({
  controllers: [BookmarksController],
  providers: [BookmarkRepository],
  exports: [BookmarkRepository], // reused by the OAuth /api/v1/bookmarks endpoints
})
export class BookmarksModule {}
