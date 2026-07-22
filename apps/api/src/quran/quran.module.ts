import { Module } from '@nestjs/common';
import { QuranController } from './quran.controller';
import { QuranService } from './quran.service';
import { QuranRepository } from './quran.repository';
import { AyahOfTheDayService } from './ayah-of-the-day.service';

@Module({
  controllers: [QuranController],
  providers: [QuranService, QuranRepository, AyahOfTheDayService],
  exports: [QuranService, QuranRepository],
})
export class QuranModule {}
