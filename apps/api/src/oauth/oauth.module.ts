import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { ReadingHistoryModule } from '../reading-history/reading-history.module';
import { AskModule } from '../ask/ask.module';
import { LogtoService } from './logto.service';
import { LogtoAuthGuard } from './logto-auth.guard';
import { LogtoMeController } from './logto-me.controller';
import { V1BookmarksController } from './v1-bookmarks.controller';
import { V1HistoryController } from './v1-history.controller';
import { V1AskController } from './v1-ask.controller';

// Third-party OAuth2 via Logto: token verification + scope enforcement +
// mapping a Logto user to our own User, and the /api/v1/* endpoints a
// third-party app calls on that user's behalf.
@Module({
  imports: [UsersModule, BookmarksModule, ReadingHistoryModule, AskModule],
  controllers: [
    LogtoMeController,
    V1BookmarksController,
    V1HistoryController,
    V1AskController,
  ],
  providers: [LogtoService, LogtoAuthGuard],
  exports: [LogtoService, LogtoAuthGuard],
})
export class OAuthModule {}
