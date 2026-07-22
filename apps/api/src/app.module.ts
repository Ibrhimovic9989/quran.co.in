import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { QuranModule } from './quran/quran.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ReadingHistoryModule } from './reading-history/reading-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    QuranModule,
    BookmarksModule,
    ReadingHistoryModule,
  ],
})
export class AppModule {}
