// Quran read endpoints.
// Paths and response shapes deliberately mirror the old Next.js routes
// (/api/quran/...) so the web frontend only changes the host, not the contract.

import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import { QuranService } from './quran.service';

function parseIntOr(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? '', 10);
  return Number.isNaN(n) ? fallback : n;
}

function badRequest(message: string): never {
  throw new HttpException({ error: message }, HttpStatus.BAD_REQUEST);
}

function notFound(body: Record<string, unknown>): never {
  throw new HttpException(body, HttpStatus.NOT_FOUND);
}

function serverError(message: string, extra: Record<string, unknown> = {}): never {
  throw new HttpException({ error: message, ...extra }, HttpStatus.INTERNAL_SERVER_ERROR);
}

function validSurahNo(raw: string): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1 || n > 114) {
    badRequest('Invalid surah number. Must be between 1 and 114.');
  }
  return n;
}

function validAyahNo(raw: string): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) {
    badRequest('Invalid ayah number.');
  }
  return n;
}

@Controller('quran')
export class QuranController {
  private readonly logger = new Logger(QuranController.name);

  constructor(private readonly quran: QuranService) {}

  @Get('surahs')
  @Header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
  async getSurahs() {
    try {
      const surahs = await this.quran.getAllSurahs('TEMPORARY_API');
      return { surahs };
    } catch (error) {
      this.logger.error('Error fetching surahs', error as Error);
      serverError('Failed to fetch surahs');
    }
  }

  @Get('surah/:number')
  @Header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  async getSurah(@Param('number') number: string) {
    const surahNo = validSurahNo(number);
    try {
      const surah = await this.quran.getSurah(surahNo, 'TEMPORARY_API');
      if (!surah) notFound({ error: 'Surah not found' });
      return { surah };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error fetching surah ${surahNo}`, error as Error);
      serverError('Failed to fetch surah');
    }
  }

  @Get('surah/:number/ayahs')
  @Header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
  async getSurahAyahs(
    @Param('number') number: string,
    @Query('offset') offsetRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const surahNo = validSurahNo(number);
    const offset = Math.max(parseIntOr(offsetRaw, 0), 0);
    const limit = Math.min(Math.max(parseIntOr(limitRaw, 20), 1), 300);
    try {
      return await this.quran.getSurahAyahs(surahNo, offset, limit);
    } catch (error) {
      this.logger.error(`Error fetching ayahs for surah ${surahNo}`, error as Error);
      serverError('Failed to fetch ayahs');
    }
  }

  @Get('surah/:number/ayah/:ayahNumber')
  async getAyah(@Param('number') number: string, @Param('ayahNumber') ayahNumber: string) {
    const surahNo = validSurahNo(number);
    const ayahNo = validAyahNo(ayahNumber);
    try {
      const ayah = await this.quran.getAyah(surahNo, ayahNo);
      return { ayah };
    } catch (error) {
      this.logger.error(`Error fetching ayah ${surahNo}:${ayahNo}`, error as Error);
      serverError('Failed to fetch ayah');
    }
  }

  @Get('juz/:juzNumber')
  @Header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
  async getJuz(
    @Param('juzNumber') juzNumber: string,
    @Query('offset') offsetRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const juzNo = parseInt(juzNumber, 10);
    const offset = Math.max(0, parseIntOr(offsetRaw, 0));
    const limit = Math.max(1, Math.min(50, parseIntOr(limitRaw, 20)));

    if (Number.isNaN(juzNo) || juzNo < 1 || juzNo > 30) {
      badRequest('Invalid Juz number. Must be between 1 and 30.');
    }

    try {
      const result = await this.quran.getJuzAyahs(juzNo, offset, limit);
      if (!result) notFound({ error: 'Juz data not found' });
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error fetching Juz ${juzNo}`, error as Error);
      serverError('Failed to fetch Juz ayahs');
    }
  }

  @Get('audio/:surahNo/:ayahNo')
  @Header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
  async getAudio(@Param('surahNo') surahNoRaw: string, @Param('ayahNo') ayahNoRaw: string) {
    const surahNumber = validSurahNo(surahNoRaw);
    const ayahNumber = validAyahNo(ayahNoRaw);
    try {
      const audioData = await this.quran.getVerseAudio(surahNumber, ayahNumber);
      if (!audioData || Object.keys(audioData).length === 0) {
        notFound({ error: 'Audio not available for this ayah', audio: null });
      }
      return { audio: audioData };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      // External API failure → same 404 contract; client falls back to surah audio.
      this.logger.warn(`Audio API error for ${surahNumber}:${ayahNumber}: ${String(error)}`);
      notFound({ error: 'Audio not available', audio: null });
    }
  }

  @Get('tafsir/:surahNo/:ayahNo')
  async getTafsir(@Param('surahNo') surahNoRaw: string, @Param('ayahNo') ayahNoRaw: string) {
    const surahNum = validSurahNo(surahNoRaw);
    const ayahNum = validAyahNo(ayahNoRaw);
    try {
      const tafsir = await this.quran.getTafsir(surahNum, ayahNum);
      return { tafsir };
    } catch (error) {
      this.logger.error(`Error fetching tafsir ${surahNum}:${ayahNum}`, error as Error);
      serverError('Failed to fetch tafsir');
    }
  }
}
