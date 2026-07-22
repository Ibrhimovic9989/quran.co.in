import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { QuranModule } from './quran/quran.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ReadingHistoryModule } from './reading-history/reading-history.module';
import { SearchModule } from './search/search.module';
import { AskModule } from './ask/ask.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    LlmModule,
    AuthModule,
    UsersModule,
    QuranModule,
    BookmarksModule,
    ReadingHistoryModule,
    SearchModule,
    AskModule,
  ],
})
export class AppModule {}
