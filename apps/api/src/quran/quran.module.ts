import { Module } from '@nestjs/common';
import { QuranController } from './quran.controller';
import { QuranService } from './quran.service';
import { QuranRepository } from './quran.repository';

@Module({
  controllers: [QuranController],
  providers: [QuranService, QuranRepository],
  exports: [QuranService, QuranRepository],
})
export class QuranModule {}
