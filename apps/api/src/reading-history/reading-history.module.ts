import { Module } from '@nestjs/common';
import { ReadingHistoryController } from './reading-history.controller';
import { ReadingHistoryRepository } from './reading-history.repository';

@Module({
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryRepository],
  exports: [ReadingHistoryRepository],
})
export class ReadingHistoryModule {}
