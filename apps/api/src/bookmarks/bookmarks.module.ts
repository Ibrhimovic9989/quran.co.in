import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarkRepository } from './bookmark.repository';

@Module({
  controllers: [BookmarksController],
  providers: [BookmarkRepository],
})
export class BookmarksModule {}
